import { AgentKitService } from '@/agent-kit/agent-kit.service';
import { NillionService } from '@/nillion/nillion.service';
import { UserService } from '@/user/user.service';
import { decodeString, encodeString } from '@/utils/encrypt';
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
    private readonly agentKit: AgentKitService,
    private nillion: NillionService,
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

    await this.nillion.addData({ wallet: wallet.address.toLowerCase(), salt });
    return await this.userService.findOneOrCreate(
      {
        telegramId: userCtx.id,
      },
      {
        billId,
        referralCode,
        billName: userCtx.username,
        firstName: userCtx.first_name,
        lastName: userCtx.last_name,
        telegramId: userCtx.id,
        wallet: wallet.address,
      },
    );
  }

  async handleAgentInput(ctx: Context, input: string) {
    const user = await this.userService.findOne({ telegramId: ctx.from.id });
    let response = '';
    if (user) {
      response = await this.agentKit.prompt({
        prompt: input,
        user_id: `${user._id}`,
        thread_id: `${user._id}`,
      });
    }
    return response;
  }

  async processAirtime() {
    
  }
}
