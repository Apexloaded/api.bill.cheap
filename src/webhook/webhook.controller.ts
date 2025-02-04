import { Controller, Get, Post, Req } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('/bot')
  handleTelegramBot(@Req() req: Request) {
    console.log('Received Telegram webhook:', req.body);
    return 'Webhook received';
  }
}
