import { Logger } from '@nestjs/common';
import {
  Update,
  Ctx,
  Start,
  Help,
  On,
  Hears,
  Action,
  Command,
} from 'nestjs-telegraf';
import { Context, Markup, Input, SessionStore } from 'telegraf';
import { BotReplies } from './bot.replies';
import {
  CallbackQuery,
  InlineKeyboardMarkup,
} from 'telegraf/typings/core/types/typegram';
import { ConfigService } from '@nestjs/config';
import { AgentKitService } from 'src/agent-kit/agent-kit.service';
import { BotService } from './bot.service';
import { UserService } from '@/user/user.service';
import { IContext } from './bot.update';

@Update()
export class BotCommand {
  private readonly logger = new Logger(BotCommand.name);

  constructor(
    private readonly botReplies: BotReplies,
    private readonly config: ConfigService,
    private readonly agentKit: AgentKitService,
    private readonly botService: BotService,
    private readonly userService: UserService,
  ) {}

  async handleSetPhone(ctx: IContext) {
    if ('text' in ctx.message && 'from' in ctx.message) {
      let phone: string;
      let phoneOperator: string;

      const response = ctx.message.text.split(' ');
      if (response.length == 3) {
        phone = response[1].replace('+', '');
        phoneOperator = response[2];
      } else if (response.length == 2) {
        phone = response[0].replace('+', '');
        phoneOperator = response[1];
      }

      if (phone && phoneOperator) {
        await this.userService.update(
          { telegramId: ctx.from.id },
          { phone, phoneOperator },
        );

        if (ctx.session.step == 'set_phone' && ctx.session.for == 'self') {
          ctx.session.recipient = phone;
          ctx.session.provider = phoneOperator;
          ctx.session.step = 'airtime_amount';
          await ctx.reply(
            `How much ${phoneOperator} airtime should I send to ${phone}?`,
            {
              parse_mode: 'Markdown',
            },
          );
        } else {
          await ctx.reply(
            `You have successfully updated your default phone number as:\n- Phone: ${phone}\n- Operator: ${phoneOperator}
          `,
            {
              parse_mode: 'Markdown',
            },
          );
        }
      } else {
        ctx.session.step = 'set_phone';
        await ctx.reply(
          "Reply with your phone number and it's service provider in this format: +234xxxxxxxxxx MTN",
          {
            parse_mode: 'Markdown',
          },
        );
      }
    }
  }
}
