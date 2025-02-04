import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AgentKitModule } from './agent-kit/agent-kit.module';
import { MongooseModule } from '@nestjs/mongoose';

import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { BotModule } from './bot/bot.module';
import { WebhookModule } from './webhook/webhook.module';
import { ContractModule } from './contract/contract.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';

import appConfig from './config/app.config';
import cdpConfig from './config/cdp.config';
import openaiConfig from './config/openai.config';
import tgConfig from './config/tg.config';


@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('app.db'),
      }),
      inject: [ConfigService],
    }),
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
    ContractModule,
    UserModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
