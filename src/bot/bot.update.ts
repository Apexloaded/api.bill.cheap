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
  Message,
  Phone,
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
import { BotCommand } from './bot.command';

interface SessionData {
  step?:
    | 'airtime_amount'
    | 'betting_amount'
    | 'electricity_amount'
    | 'betting_user_id'
    | 'cable_iuc'
    | 'data_phone_number'
    | 'electricity_meter'
    | 'set_phone';
  serviceName?: 'Airtime Topup';
  for?: string;
  recipient?: string;
  provider?: string;
  plan?: string;
  amount?: string;
  text?: string;
  meterNumber?: string;
  userId?: string;
}

export interface IContext extends Context {
  session?: SessionData;
}

@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(
    private readonly botReplies: BotReplies,
    private readonly config: ConfigService,
    private readonly agentKit: AgentKitService,
    private readonly botService: BotService,
    private readonly botCommand: BotCommand,
  ) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    try {
      const user = await this.botService.handleAuthentication(ctx);
      const keyboard = this.botReplies.welcomeKeyboard;
      const text = await this.botReplies.generateWelcomeMessage(
        ctx.from.first_name,
        user.referralCode,
      );
      const imageUrl = this.config.get('tg.banner');
      await ctx.replyWithPhoto(
        { url: imageUrl },
        { caption: text, parse_mode: 'Markdown', ...keyboard },
      );
    } catch (error) {}
  }

  @Command('setphone')
  async setPhone(@Ctx() ctx: Context) {
    await this.botCommand.handleSetPhone(ctx);
  }

  @Action(/^service:/)
  async completeCommunity(@Ctx() ctx: Context) {
    try {
      const callbackQuery = ctx.callbackQuery as unknown as { data: string };
      const service = callbackQuery.data.split(':')[1];

      let buttons;
      let text;

      switch (service) {
        case 'airtime':
          const response = await this.botReplies.getAirtimeButtons();
          text = response.message;
          buttons = response.button;
          break;
        case 'mobile_data':
          buttons = this.botReplies.getMobileDataButtons();
          text = 'Select your mobile data provider:';
          break;
        case 'cable_tv':
          buttons = this.botReplies.getCableTvButtons();
          text = 'Select your cable TV provider:';
          break;
        case 'electricity':
          buttons = this.botReplies.getElectricityButtons();
          text = 'Select your electricity provider:';
          break;
        case 'betting':
          buttons = this.botReplies.getBettingButtons();
          text = 'Select your betting provider:';
          break;
        case 'gift_cards':
          buttons = this.botReplies.getGiftCardButtons();
          text = 'Select your gift card provider:';
          break;
        default:
          buttons = [];
          text = 'Service not available. Please select a valid option:';
      }

      // Create a new keyboard with the service buttons and a single "Back" button
      const keyboard = Markup.inlineKeyboard([
        ...buttons,
        [Markup.button.callback('⬅️ Back to Main Menu', 'back_to_main')],
      ]);

      await ctx.editMessageCaption(text, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown',
      });
    } catch (error) {}
  }

  @Action('back_to_main')
  async backToMainMenu(@Ctx() ctx: Context) {
    try {
      const user = await this.botService.handleAuthentication(ctx);
      const text = await this.botReplies.generateWelcomeMessage(
        ctx.from.first_name,
        user.referralCode,
      );
      await ctx.editMessageCaption(text, {
        reply_markup: this.botReplies.welcomeKeyboard.reply_markup,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      this.logger.error('Failed to go back to main menu', error.stack);
    }
  }

  @Action(/^for:/)
  async handleProviderSelection(@Ctx() ctx: IContext) {
    try {
      const callbackQuery = ctx.callbackQuery as unknown as { data: string };
      const [, selectedFor, service] = callbackQuery.data.split(':');

      let text: string;
      let keyboard: Markup.Markup<InlineKeyboardMarkup>;

      switch (service) {
        case 'airtime':
          const res = await this.botReplies.getAirtimeButtons(
            selectedFor,
            service,
            ctx,
          );
          ctx.session.serviceName = 'Airtime Topup';
          text = res.message;
          keyboard = res.button;
          break;

        case 'data':
          text = `You've selected ${selectedFor} for mobile data. Please choose a data plan:`;
          keyboard = Markup.inlineKeyboard([
            [
              Markup.button.callback(
                '1GB - ₦300',
                `data_plan:${selectedFor}:1GB:300`,
              ),
            ],
            [
              Markup.button.callback(
                '2GB - ₦500',
                `data_plan:${selectedFor}:2GB:500`,
              ),
            ],
            [
              Markup.button.callback(
                '5GB - ₦1000',
                `data_plan:${selectedFor}:5GB:1000`,
              ),
            ],
            [Markup.button.callback('Cancel', 'cancel_transaction')],
          ]);
          break;

        case 'cable':
          text = `You've selected ${selectedFor} for cable TV. Please enter your SmartCard/IUC Number:`;
          keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('Cancel', 'cancel_transaction')],
          ]);
          // Set the next step in the conversation
          ctx.session.step = 'cable_iuc';
          ctx.session.for = selectedFor;
          break;

        case 'electricity':
          text = `You've selected ${selectedFor} for electricity. Please enter your Meter Number:`;
          keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('Cancel', 'cancel_transaction')],
          ]);
          // Set the next step in the conversation
          ctx.session.step = 'electricity_meter';
          ctx.session.for = selectedFor;
          break;

        case 'betting':
          text = `You've selected ${selectedFor} for betting. Please enter your ${selectedFor} User ID:`;
          keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('Cancel', 'cancel_transaction')],
          ]);
          // Set the next step in the conversation
          ctx.session.step = 'betting_user_id';
          ctx.session.for = selectedFor;
          break;

        case 'giftcard':
          text = `You've selected ${selectedFor} gift card. Please choose a denomination:`;
          keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('$10', `giftcard:${selectedFor}:10`)],
            [Markup.button.callback('$25', `giftcard:${selectedFor}:25`)],
            [Markup.button.callback('$50', `giftcard:${selectedFor}:50`)],
            [Markup.button.callback('$100', `giftcard:${selectedFor}:100`)],
            [Markup.button.callback('Cancel', 'cancel_transaction')],
          ]);
          break;

        default:
          text = 'Invalid selection. Please try again.';
          keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('Back to Services', 'back_to_services')],
          ]);
      }

      await ctx.editMessageCaption(text, {
        ...(keyboard && { reply_markup: keyboard.reply_markup }),
        parse_mode: 'Markdown',
      });
    } catch (error) {
      this.logger.error('Failed to handle provider selection', error.stack);
      await ctx.answerCbQuery('An error occurred. Please try again.');
    }
  }

  @Action('cancel_transaction')
  async cancelTransaction(@Ctx() ctx: IContext) {
    try {
      delete ctx.session.step;
      delete ctx.session.provider;
      const text = 'Transaction cancelled. What would you like to do?';
      await ctx.editMessageCaption(text, {
        reply_markup: this.botReplies.welcomeKeyboard.reply_markup,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      this.logger.error('Failed to cancel transaction', error.stack);
    }
  }

  @Action(/^data_plan:/)
  async handleDataPlanSelection(@Ctx() ctx: IContext) {
    try {
      const callbackQuery = ctx.callbackQuery as unknown as { data: string };
      const [, provider, plan, amount] = callbackQuery.data.split(':');
      const text = `You've selected a ${plan} data plan for ${provider} at ₦${amount}. Please enter the phone number:`;
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Cancel', 'cancel_transaction')],
      ]);
      ctx.session.step = 'data_phone_number';
      ctx.session.provider = provider;
      ctx.session.plan = plan;
      ctx.session.amount = amount;
      await ctx.editMessageCaption(text, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      this.logger.error('Failed to handle data plan selection', error.stack);
    }
  }

  @Action(/^giftcard:/)
  async handleGiftCardSelection(@Ctx() ctx: Context) {
    try {
      const callbackQuery = ctx.callbackQuery as unknown as {
        data: string;
      };
      const [, provider, amount] = callbackQuery.data.split(':');
      const text = `You've selected a $${amount} ${provider} gift card. Please confirm your purchase:`;
      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback(
            'Confirm Purchase',
            `confirm_giftcard:${provider}:${amount}`,
          ),
        ],
        [Markup.button.callback('Cancel', 'cancel_transaction')],
      ]);
      await ctx.editMessageCaption(text, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      this.logger.error('Failed to handle gift card selection', error.stack);
    }
  }

  @Action(/^confirm_giftcard:/)
  async confirmGiftCardPurchase(@Ctx() ctx: Context) {
    try {
      const callbackQuery = ctx.callbackQuery as unknown as {
        data: string;
      };
      const [, provider, amount] = callbackQuery.data.split(':');
      // Here you would typically process the gift card purchase
      const text = `Your $${amount} ${provider} gift card purchase has been confirmed. You will receive the code shortly.`;
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Back to Main Menu', 'back_to_main')],
      ]);
      await ctx.editMessageCaption(text, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      this.logger.error('Failed to confirm gift card purchase', error.stack);
    }
  }

  @Action(/^pay:/)
  async initializePayment(@Ctx() ctx: IContext) {
    const callbackQuery = ctx.callbackQuery as unknown as {
      data: string;
    };
    const [, tokenAddress] = callbackQuery.data.split(':');
    await ctx.editMessageCaption('Processing Request...', {
      parse_mode: 'Markdown',
    });

    const recipient = ctx.session.recipient;
    const provider = ctx.session.provider;
    const amount = ctx.session.amount;
    const serviceName = ctx.session.serviceName;
    const aiInput = `
      Process ${serviceName}:\n
      Phone: ${recipient}\n
      Amount: ${amount}\n
      Provider: ${provider}\n
      Token Address: ${tokenAddress}
    `;

    const response = await this.botService.handleAgentInput(ctx, aiInput);
    await ctx.editMessageCaption(
      response ??
        "I didn't understand that. Please use the menu options or type /start to begin.",
      {
        parse_mode: 'Markdown',
      },
    );
  }

  @On('text')
  async handleTextInput(@Ctx() ctx: IContext) {
    try {
      if ('text' in ctx.message && 'from' in ctx.message) {
        const text = ctx.message.text;
        const step = ctx.session.step;
        console.log(ctx.session);
        switch (step) {
          case 'set_phone': {
            return await this.botCommand.handleSetPhone(ctx);
          }
          case 'airtime_amount': {
            const recipient = ctx.session.recipient;
            const provider = ctx.session.provider;
            if (!recipient || !provider) {
              await ctx.reply(
                'Please provide both phone number and amount. Example: 08012345678 500',
              );
              return;
            }
            ctx.session.amount = text;
            await this.botReplies.getBalanceButtons(ctx);
            // delete ctx.session.recipient;
            // delete ctx.session.provider;
            // delete ctx.session.for;
            // delete ctx.session.step;
            // delete ctx.session.provider;
            // await ctx.reply(res, {
            //   parse_mode: 'Markdown',
            // });
            break;
          }
          case 'cable_iuc':
            // Process cable TV IUC number
            // Here you would typically validate the IUC number and fetch available plans
            await ctx.reply(
              `IUC number ${text} for ${ctx.session.provider} has been received. Please choose a plan:`,
            );
            // You would typically show available plans here
            delete ctx.session.step;
            delete ctx.session.provider;
            break;
          case 'electricity_meter':
            // Process electricity meter number
            // Here you would typically validate the meter number and fetch available options
            await ctx.reply(
              `Meter number ${text} for ${ctx.session.provider} has been received. Please enter the amount:`,
            );
            ctx.session.step = 'electricity_amount';
            ctx.session.meterNumber = text;
            break;
          case 'electricity_amount':
            // Process electricity amount
            // Here you would typically process the electricity purchase
            await ctx.reply(
              `Electricity purchase of ₦${text} for meter number ${ctx.session.meterNumber} on ${ctx.session.provider} has been processed.`,
            );
            delete ctx.session.step;
            delete ctx.session.provider;
            delete ctx.session.meterNumber;
            break;
          case 'betting_user_id':
            // Process betting user ID
            // Here you would typically validate the user ID and fetch available options
            await ctx.reply(
              `User ID ${text} for ${ctx.session.provider} has been received. Please enter the amount to fund:`,
            );
            ctx.session.step = 'betting_amount';
            ctx.session.userId = text;
            break;
          case 'betting_amount':
            // Process betting amount
            // Here you would typically process the betting account funding
            await ctx.reply(
              `Account funding of ₦${text} for user ID ${ctx.session.userId} on ${ctx.session.provider} has been processed.`,
            );
            delete ctx.session.step;
            delete ctx.session.provider;
            delete ctx.session.userId;
            break;
          case 'data_phone_number':
            // Process data plan phone number
            // Here you would typically process the data plan purchase
            await ctx.reply(
              `Data plan ${ctx.session.plan} (₦${ctx.session.amount}) for ${text} on ${ctx.session.provider} has been processed.`,
            );
            delete ctx.session.step;
            delete ctx.session.provider;
            delete ctx.session.plan;
            delete ctx.session.amount;
            break;
          default:
            const res = await this.botService.handleAgentInput(ctx, text);
            await ctx.reply(
              res ??
                "I didn't understand that. Please use the menu options or type /start to begin.",
              {
                parse_mode: 'Markdown',
              },
            );
        }
      }
    } catch (error) {
      this.logger.error('Failed to handle text input', error.stack);
      await ctx.reply(
        'An error occurred. Please try again or use /start to restart.',
      );
    }
  }

  @Action('back_to_services')
  async backToServices(@Ctx() ctx: Context) {
    try {
      const text = 'What service would you like to use?';
      await ctx.editMessageCaption(text, {
        reply_markup: this.botReplies.welcomeKeyboard.reply_markup,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      this.logger.error('Failed to go back to services', error.stack);
    }
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    try {
      ctx.reply(
        'Available commands:\n' +
          '/start - Start bot\n' +
          '/help - List available commands\n' +
          '/link - Retrieve referral details\n' +
          '/stats - Display your referral stats\n' +
          '/leaderboard - List top 10 referrers',
      );
    } catch (error) {
      this.logger.error('Failed to display help', error.stack);
    }
  }
}
