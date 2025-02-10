import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { Context, Telegraf } from 'telegraf';
import { getBotToken } from 'nestjs-telegraf';
import { BOT_NAME } from '@/config/tg.config';

@Module({
  controllers: [WebhookController],
  providers: [
    WebhookService,
    {
      provide: WebhookController,
      useFactory: (bot: Telegraf<Context>, webhookService: WebhookService) => {
        return new WebhookController(bot, webhookService);
      },
      inject: [getBotToken(BOT_NAME), WebhookService],
    },
  ],
})
export class WebhookModule {}
