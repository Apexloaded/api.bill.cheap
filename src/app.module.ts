import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AgentKitModule } from './agent-kit/agent-kit.module';
import cdpConfig from './config/cdp.config';
import openaiConfig from './config/openai.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [cdpConfig, openaiConfig],
      envFilePath: ['.env.local'],
    }),
    AgentKitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
