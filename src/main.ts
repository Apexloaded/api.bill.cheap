import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getBotToken } from 'nestjs-telegraf';
import { BOT_NAME } from './config/tg.config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  process.on('unhandledRejection', (reason, promise) => {
    console.log(promise);
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    // Application specific logging, throwing an error, or other logic here
  });
  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`, error.stack);
    // Application specific logging, throwing an error, or other logic here
  });

  const app = await NestFactory.create(AppModule);
  const billcheap_bot = app.get(getBotToken(BOT_NAME));

  app.use(billcheap_bot.webhookCallback('/webhook/tg/bot'));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3100);
}
bootstrap();
