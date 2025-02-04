import { AuthSessionProvider } from '@/enums/cookie.enum';
import { AudienceType } from '@/enums/reloadly.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthSessionDocument = HydratedDocument<AuthSession>;

@Schema({ timestamps: true })
export class AuthSession {
  @Prop({ enum: AudienceType })
  audience: AudienceType;

  @Prop()
  accessToken: string;

  @Prop()
  expiresIn: number;

  @Prop()
  tokenType: string;

  @Prop({ enum: AuthSessionProvider })
  provider: AuthSessionProvider;

  @Prop()
  scope: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);
