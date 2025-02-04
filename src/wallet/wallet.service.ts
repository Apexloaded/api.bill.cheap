import { encodeString } from '@/utils/encrypt';
import { Injectable } from '@nestjs/common';
import { Mnemonic, Wallet } from 'ethers';
import { toHex } from 'viem';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ExtractWalletDto } from './dto/extract-wallet.dto';

@Injectable()
export class WalletService {
  private encryptionKey: string;
  private secretKey: string;

  constructor(private config: ConfigService) {
    this.encryptionKey = this.config.get<string>('app.encryptionKey');
    this.secretKey = this.config.get<string>('app.secretKey');
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
    };
  }
}
