import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { IExchangeRateApi } from './types/exchange.type';

@Injectable()
export class ExchangeService {
  private fxRateApi;
  constructor(
    private config: ConfigService,
    private http: HttpService,
  ) {
    this.fxRateApi = this.config.get<string>('app.exhangeRate');
  }
  async getExchangeRate(base: string, target: string) {
    const url = `${this.fxRateApi}/pair/${base.toUpperCase()}/${target.toUpperCase()}`;
    const { data } = await firstValueFrom(
      this.http.get(url).pipe(
        map((response: AxiosResponse<IExchangeRateApi>) => response),
        catchError((error: AxiosError) => {
          console.log('Reloadly Error', error);
          if (error.response?.status === 401) {
            return throwError(
              () => new UnauthorizedException(error.response.statusText),
            );
          }
          return throwError(() => error); // Rethrow other errors
        }),
      ),
    );

    return {
      base,
      target,
      rate: data,
    };
  }
}
