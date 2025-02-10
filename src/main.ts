import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getBotToken } from 'nestjs-telegraf';
import { BOT_NAME } from './config/tg.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const billcheap_bot = app.get(getBotToken(BOT_NAME));

  app.use(billcheap_bot.webhookCallback('/webhook/bot'));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3100);
}
bootstrap();
