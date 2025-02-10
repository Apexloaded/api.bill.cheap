import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { InjectBot } from 'nestjs-telegraf';
import { BOT_NAME } from '@/config/tg.config';
import { Context, Telegraf } from 'telegraf';
import { Response, Request } from 'express';

@Controller('webhook')
export class WebhookController {
  constructor(
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
    private readonly webhookService: WebhookService,
  ) {}

  @Post('/tg/billcheap_bot')
  async handleTelegramBot(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.bot.handleUpdate(req.body);
    res.status(res.statusCode).send()
  }
}
