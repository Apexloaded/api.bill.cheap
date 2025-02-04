import { AuthSessionProvider } from '@/enums/cookie.enum';
import { AudienceType } from '@/enums/reloadly.enum';

export class ReloadlyAuthRequest {
  audience: string;
  client_id: string;
  client_secret: string;
  grant_type: 'client_credentials';
}

export class CreateReloadlyAuthDto {
  audience: AudienceType;
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
  provider: AuthSessionProvider;
}

export class ReloadlyAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}
