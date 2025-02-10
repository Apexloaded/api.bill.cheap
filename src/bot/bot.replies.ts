import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { IContext } from './bot.update';
import { BillProvider } from '@/bill/bill.provider';
import { formatCurrency } from '@/utils/helpers';

@Injectable()
export class BotReplies {
  private appUrl: string;
  private communityUrl: string;
  private channelUrl: string;
  private bot: string;

  constructor(
    private readonly config: ConfigService,
    private userService: UserService,
    private billProvider: BillProvider,
  ) {
    this.appUrl = this.config.get<string>('tg.appUrl');
    this.communityUrl = this.config.get<string>('tg.community');
    this.channelUrl = this.config.get<string>('tg.channel');
    this.bot = this.config.get<string>('tg.botToken');
  }

  get welcomeKeyboard(): Markup.Markup<InlineKeyboardMarkup> {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📱 Airtime', 'service:airtime'),
        Markup.button.callback('📶 Mobile Data', 'service:mobile_data'),
      ],
      [
        Markup.button.callback('📺 Cable Tv', 'service:cable_tv'),
        Markup.button.callback('💡 Electricity', 'service:electricity'),
      ],
      [
        Markup.button.callback('🏐 Betting', 'service:betting'),
        Markup.button.callback('🎁 Gift Card', 'service:gift_cards'),
      ],
      [Markup.button.url('Join Community 👥', this.communityUrl)],
      [Markup.button.url('Subscribe 📌', this.channelUrl)],
    ]);
  }

  async getAirtimeButtons(
    selectedFor?: string,
    service?: string,
    ctx?: IContext,
  ) {
    let button;
    let message: string;

    if (!selectedFor && !service && !ctx) {
      button = [
        [
          Markup.button.callback('SELF', 'for:self:airtime'),
          Markup.button.callback('OTHERS', 'for:others:airtime'),
        ],
      ];
      message = 'Who would you like to topup airtime for?';
    } else if (selectedFor && service && ctx) {
      if (selectedFor.toLowerCase() === 'self') {
        const user = await this.userService.findOne({
          telegramId: ctx.from.id,
        });
        if (!user.phone) {
          message = `
          Kindly set your phone number by replying in this format: +23481xxxxxxxx MTN
        `;
          ctx.session.step = 'set_phone';
        } else {
          message = `
          How much airtime ${user.phoneOperator.toUpperCase()} should I send to ${user.phone}?
        `;
          ctx.session.recipient = user.phone;
          ctx.session.provider = user.phoneOperator;
          ctx.session.step = 'airtime_amount';
        }
      }
      if (selectedFor.toLowerCase() === 'others') {
        message = `
          Who should I send airtime to and how much? Please reply with their phone number in this format:\n
          +23481xxxxxxxx MTN 5000
        `;
        ctx.session.step = 'airtime_amount';
      }
      ctx.session.for = selectedFor;
    }

    return {
      button,
      message,
    };
  }

  getMobileDataButtons() {
    return [
      [
        Markup.button.callback('MTN', 'provider:mtn:data'),
        Markup.button.callback('Airtel', 'provider:airtel:data'),
      ],
      [
        Markup.button.callback('Glo', 'provider:glo:data'),
        Markup.button.callback('9mobile', 'provider:9mobile:data'),
      ],
    ];
  }

  getCableTvButtons() {
    return [
      [Markup.button.callback('DSTV', 'provider:dstv:cable')],
      [Markup.button.callback('GOTV', 'provider:gotv:cable')],
      [Markup.button.callback('StarTimes', 'provider:startimes:cable')],
    ];
  }

  getElectricityButtons() {
    return [
      [Markup.button.callback('IKEDC', 'provider:ikedc:electricity')],
      [Markup.button.callback('EKEDC', 'provider:ekedc:electricity')],
      [Markup.button.callback('AEDC', 'provider:aedc:electricity')],
    ];
  }

  getBettingButtons() {
    return [
      [Markup.button.callback('Bet9ja', 'provider:bet9ja:betting')],
      [Markup.button.callback('NairaBet', 'provider:nairabet:betting')],
      [Markup.button.callback('BetKing', 'provider:betking:betting')],
    ];
  }

  async getBalanceButtons(ctx: Context) {
    const user = await this.userService.findOne({ telegramId: ctx.from.id });
    const paymentTokens = await this.billProvider.listPaymentTokens(
      user.wallet,
    );
    const payOptions = paymentTokens.reduce((acc, token, index) => {
      const button = Markup.button.callback(
        `${token.symbol} $${formatCurrency(token.balanceInUsd)}`,
        `pay:${token.address}`,
      );

      if (index % 2 === 0) {
        acc.push([button]); // Start a new pair
      } else {
        acc[acc.length - 1].push(button); // Add to the last pair
      }
      return acc;
    }, []);

    const text = `Select your preferred payment method to complete your transaction`;
    const options: Markup.Markup<InlineKeyboardMarkup> = Markup.inlineKeyboard([
      ...payOptions,
    ]);
    const imageUrl =
      'https://res.cloudinary.com/dztbnrl7z/image/upload/v1735886323/s4jlwta4r2fbtfaiwxvm.png';
    await ctx.replyWithPhoto(
      { url: imageUrl },
      {
        caption: text,
        parse_mode: 'Markdown',
        ...options,
      },
    );
  }

  getGiftCardButtons() {
    return [
      [Markup.button.callback('iTunes', 'provider:itunes:giftcard')],
      [Markup.button.callback('Amazon', 'provider:amazon:giftcard')],
      [Markup.button.callback('Google Play', 'provider:googleplay:giftcard')],
    ];
  }

  get taskKeyboard(): Markup.Markup<InlineKeyboardMarkup> {
    return Markup.inlineKeyboard([
      [Markup.button.url('Join Community 👥', this.communityUrl)],
      [Markup.button.url('Subscribe to Channel 📌', this.channelUrl)],
      [Markup.button.callback('Completed ✅', 'complete_community')],
    ]);
  }

  get refreshLeaderboardKeyboard(): Markup.Markup<InlineKeyboardMarkup> {
    return Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Refresh', 'refresh_leaderboard')],
    ]);
  }

  async generateWelcomeMessage(
    name: string,
    referralCode: string,
  ): Promise<string> {
    const refLink = `${this.appUrl}?start=${referralCode}`;
    const text =
      `*Hi, ${name ?? 'there'}! 🎉Welcome to Billcheap 📱 AI agent!*\n\n` +
      `You can seamlessly automate and start paying your bills with crypto *USDT*, *USDC* and *ETH*, using this bot.\n\n` +
      `📌 Start by: \n` +
      `Sharing your referral link below to your friends.\n\n` +
      `🔗 Referral link:\n` +
      `\`${refLink}\` (Tap to copy)\n`;

    return text;
  }
}
