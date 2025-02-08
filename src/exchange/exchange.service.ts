import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { IExchangeRateApi } from './types/exchange.type';
import { HermesClient } from '@pythnetwork/hermes-client';

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

  async getCryptoUsdRates(priceIds: string[]) {
    const connection = new HermesClient(this.config.get('app.pythUrl'), {});
    const priceUpdates = await connection.getLatestPriceUpdates(priceIds, {
      parsed: true,
      ignoreInvalidPriceIds: true,
    });

    const parsedData = priceUpdates.parsed;

    if (parsedData.length === 0) {
      throw new Error(`No price data found`);
    }

    return parsedData.map((data) => {
      // Convert prices based on exponent
      const ema_price = parseFloat(data.ema_price.price);
      const price = parseFloat(data.price.price);
      const conf = parseFloat(data.price.conf);

      const expo = Math.pow(10, data.price.expo);
      const currentPrice = (price * expo).toFixed(2);
      const emaPrice = (ema_price * expo).toFixed(2);
      const confidence = (conf * expo).toFixed(4);

      // Convert timestamp to Date object
      const timestamp = new Date(data.price.publish_time * 1000);

      return {
        id: `0x${data.id}`,
        currentPrice: currentPrice,
        emaPrice: emaPrice,
        confidence: confidence,
        timestamp: timestamp,
      };
    });
  }
}
