import { UserService } from '@/user/user.service';
import { encodeString } from '@/utils/encrypt';
import { generateId } from '@/utils/helpers';
import { WalletService } from '@/wallet/wallet.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context } from 'telegraf';

@Injectable()
export class BotService {
  private encryptionKey: string;

  constructor(
    private userService: UserService,
    private config: ConfigService,
    private walletService: WalletService,
  ) {
    this.encryptionKey = this.config.get<string>('app.encryptionKey');
  }

  async handleAuthentication(ctx: Context) {
    const userCtx = ctx.from;
    const user = await this.userService.findOne({ telegramId: userCtx.id });
    if (user) return user;

    const referralCode = generateId({ dictionary: 'hex', length: 9 });
    const billId = generateId({ dictionary: 'number', length: 6 });
    const userSalt = generateId({ dictionary: 'hex', length: 64 });
    const salt = await encodeString(userSalt, true, this.encryptionKey);

    const { wallet } = await this.walletService.extractWalletAddress({
      billId,
      userSalt,
      referralCode,
    });

    return await this.userService.findOneOrCreate(
      {
        telegramId: userCtx.id,
      },
      {
        billId,
        salt,
        referralCode,
        billName: userCtx.username,
        firstName: userCtx.first_name,
        lastName: userCtx.last_name,
        telegramId: userCtx.id,
        wallet: wallet.address,
      },
    );
  }
}
