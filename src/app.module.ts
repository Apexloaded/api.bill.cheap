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
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import { ReloadlyModule } from './reloadly/reloadly.module';
import { AuthModule } from './auth/auth.module';

import appConfig from './config/app.config';
import cdpConfig from './config/cdp.config';
import openaiConfig from './config/openai.config';
import tgConfig, { BOT_NAME } from './config/tg.config';

import { APP_GUARD } from '@nestjs/core';
import { TelegramThrottlerGuard } from './guards/telegram.throttler.guard';
import { RolesGuard } from './guards/role.guard';
import { BillModule } from './bill/bill.module';
import { ExchangeModule } from './exchange/exchange.module';
import { TransactionModule } from './transaction/transaction.module';
import { NetworkModule } from './network/network.module';
import contractConfig from './config/contract.config';
import { GatewayModule } from './contract/gateway/gateway.module';
import { NillionModule } from './nillion/nillion.module';
import nillionConfig from './config/nillion.config';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3, // Not more than 3 calls per second
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20, // Not more than 20 calls per 10 seconds
      },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('app.db'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        cdpConfig,
        openaiConfig,
        tgConfig,
        contractConfig,
        nillionConfig,
      ],
      envFilePath: ['.env.local'],
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      botName: BOT_NAME,
      useFactory: async (configService: ConfigService) => ({
        token: configService.get('tg.botToken'),
        middlewares: [session()],
        include: [BotModule],
        launchOptions: {
          webhook: {
            domain: configService.get<string>('app.hostname'),
            path: '/webhook/tg/bot',
          },
        },
      }),
      inject: [ConfigService],
    }),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    AgentKitModule,
    BotModule,
    WebhookModule,
    ContractModule,
    UserModule,
    WalletModule,
    ReloadlyModule,
    AuthModule,
    BillModule,
    ExchangeModule,
    TransactionModule,
    NetworkModule,
    GatewayModule,
    NillionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: TelegramThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
