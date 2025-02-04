import { Module } from '@nestjs/common';
import { ReloadlyService } from './reloadly.service';
import { ReloadlyController } from './reloadly.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthSession, AuthSessionSchema } from '@/auth/entities/auth.entity';
import { ReloadlyHttpService } from './reloadly.http.service';
import { ReloadlyAuthService } from './auth/reloadly.auth.service';
import { ReloadlyTokenStorageService } from './auth/reloadly.storage.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import reloadlyConfig from '@/config/reloadly.config';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.local'],
      load: [reloadlyConfig],
    }),
    MongooseModule.forFeature([
      { name: AuthSession.name, schema: AuthSessionSchema },
    ]),
  ],
  controllers: [ReloadlyController],
  providers: [
    ReloadlyService,
    ReloadlyHttpService,
    ReloadlyAuthService,
    ReloadlyTokenStorageService,
  ],
  exports: [ReloadlyService],
})
export class ReloadlyModule {}
