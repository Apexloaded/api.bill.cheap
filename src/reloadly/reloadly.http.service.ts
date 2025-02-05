import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { ReloadlyAuthRequest } from './dto/reloadly-auth.dto';
import { ConfigService } from '@nestjs/config';

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
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<any>> {
    config = this.addAuthorizationHeader(config, accessToken);
    return this.httpService.post(url, data, config);
  }

  get(
    url: string,
    accessToken: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<any>> {
    config = this.addAuthorizationHeader(config, accessToken);
    return this.httpService.get(url, config);
  }

  private addAuthorizationHeader(
    config?: AxiosRequestConfig,
    accessToken?: string,
  ): AxiosRequestConfig {
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/com.reloadly.topups-v1+json',
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
