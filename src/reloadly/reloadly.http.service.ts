import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { ReloadlyAuthRequest } from './dto/reloadly-auth.dto';
import { ConfigService } from '@nestjs/config';
import { AudienceType } from '@/enums/reloadly.enum';

@Injectable()
export class ReloadlyHttpService {
  private readonly apiUrl: string;
  private readonly appKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.apiUrl = this.config.get('reloadly.altHost');
    this.appKey = this.config.get('app.id');
  }

  auth(
    url: string,
    data?: ReloadlyAuthRequest,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<any>> {
    return this.httpService.post(url, data, {
      headers: {
        ...config.headers,
      },
    });
  }

  post<T>(
    url: string,
    data: T,
    accessToken: string,
    key: AudienceType,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<any>> {
    config = this.addAuthorizationHeader(key, config, accessToken);
    return this.httpService.post(url, data, config);
  }

  get(
    url: string,
    accessToken: string,
    key: AudienceType,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<any>> {
    console.log(key);
    config = this.addAuthorizationHeader(key, config, accessToken);
    return this.httpService.get(url, config);
  }

  private addAuthorizationHeader(
    key: AudienceType,
    config?: AxiosRequestConfig,
    accessToken?: string,
  ): AxiosRequestConfig {
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: `application/com.reloadly.${key}-v1+json`,
      },
    };
  }

  private addAuthHeader(
    url?: string,
    accessToken?: string,
  ): AxiosRequestConfig {
    return {
      headers: {
        'x-audience-url': url,
        'x-reloadly-access-token': accessToken,
        'x-bc-key': this.appKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
  }
}
