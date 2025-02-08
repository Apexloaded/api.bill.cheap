import { decodeString, encodeString } from '@/utils/encrypt';
import { Injectable } from '@nestjs/common';
import { Mnemonic, Wallet } from 'ethers';
import { toHex } from 'viem';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ExtractWalletDto } from './dto/extract-wallet.dto';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { NillionService } from '@/nillion/nillion.service';
import { WalletResult } from '@/nillion/schema/wallet.schema';

@Injectable()
export class WalletService {
  private encryptionKey: string;
  private secretKey: string;

  constructor(
    private config: ConfigService,
    private userService: UserService,
    private nillion: NillionService,
  ) {
    this.encryptionKey = this.config.get<string>('app.encryptionKey');
    this.secretKey = this.config.get<string>('app.secretKey');
  }
  async getUserWallet(id: string) {
    const user = await this.userService.findOne({ _id: id });
    if (user) {
      const data = await this.nillion.readData<WalletResult>({
        wallet: user.wallet.toLowerCase(),
      });
      const result = data.results.flatMap((r) => r.data);
      const userSalt = await this.nillion.decryptSalt(result[0].salt);
      const salt = await decodeString(userSalt, true, this.encryptionKey);
      const response = await this.extractWalletAddress({
        billId: user.billId,
        userSalt: salt,
        referralCode: user.referralCode,
      });
      return { ...response, user };
    }
  }
  async extractWalletAddress(data: ExtractWalletDto) {
    const { billId, userSalt, referralCode } = data;
    const payload = JSON.stringify({
      billId: billId.toLowerCase(),
      userSalt: userSalt.toLowerCase(),
      referralCode: referralCode.toLowerCase(),
    });

    const salt = toHex(
      crypto.createHash('sha256').update(`${payload}`).digest('hex'),
    );
    const keyToEncode = JSON.stringify({
      id: payload,
      salt,
      secret: this.secretKey,
    });

    const seed = crypto.createHash('sha256').update(keyToEncode).digest();
    const phrase = Mnemonic.entropyToPhrase(Uint8Array.from(seed));
    const wallet = Wallet.fromPhrase(phrase);
    const key = seed.toString('hex');
    const encryptedWallet = await wallet.encrypt(key);
    const encodedWallet = await encodeString(
      encryptedWallet,
      true,
      this.encryptionKey,
    );
    return {
      wallet,
      encryptedWallet,
      encodedWallet,
      seedPhrase: phrase,
    };
  }
}
