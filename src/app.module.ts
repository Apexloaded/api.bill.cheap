import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AgentKitModule } from './agent-kit/agent-kit.module';
import appConfig from './config/app.config';
import cdpConfig from './config/cdp.config';
import openaiConfig from './config/openai.config';
import tgConfig from './config/tg.config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { BotModule } from './bot/bot.module';
import { WebhookModule } from './webhook/webhook.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, cdpConfig, openaiConfig, tgConfig],
      envFilePath: ['.env.local'],
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get('tg.botToken'),
        middlewares: [session()],
        include: [BotModule],
        // launchOptions: {
        //   webhook: {
        //     domain: configService.get<string>('app.hostname'),
        //     path: '/webhook/bot',
        //   },
        // },
      }),
      inject: [ConfigService],
    }),
    AgentKitModule,
    BotModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
