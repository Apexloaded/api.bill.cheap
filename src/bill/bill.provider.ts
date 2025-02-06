import { AudienceType, reloadlyPath } from '@/enums/reloadly.enum';
import { ReloadlyService } from '@/reloadly/reloadly.service';
import { Injectable } from '@nestjs/common';
import {
  PaginatedProviderList,
  Provider,
  SelectProvider,
} from './types/provider.type';
import { CreateBillDto } from './dto/create-bill.dto';
import {
  generateId,
  generateUniqueRandomArray,
  getPercentage,
} from '@/utils/helpers';
import { BillService } from './bill.service';
import { User } from '@/user/entities/user.entity';
import { Bill, BillType } from './entities/bill.entity';
import { AirtimeService } from './airtime/airtime.service';
import { ExchangeService } from '@/exchange/exchange.service';
import { Airtime } from './airtime/entities/airtime.entity';
import { TransactionService } from '@/transaction/transaction.service';
import {
  PaymentMethods,
  TxType,
} from '@/transaction/entities/transaction.entity';

@Injectable()
export class BillProvider {
  private desc = {
    [BillType.AIRTIME]: 'Airtime Topup',
    [BillType.MOBILE_DATA]: 'Mobile Data',
  };

  constructor(
    private readonly reloadly: ReloadlyService,
    private billService: BillService,
    private airtimeService: AirtimeService,
    private exchangeService: ExchangeService,
    private txService: TransactionService,
  ) {}

  async autoDetectProvider(phone: string, iso: string) {
    if (!phone || !iso) {
      throw new Error('Phone and ISO are required parameters.');
    }

    const url = this.reloadly.getUrl(
      AudienceType.Airtime,
      reloadlyPath.autoDetectProvider(phone, iso),
    );
    const options = {
      suggestedAmountsMap: true,
      suggestedAmounts: true,
      includePin: true,
    };

    const queryParams = new URLSearchParams(
      options as unknown as Record<string, string>,
    ).toString();
    const urlWithISO = `${url}?${queryParams}`;
    const operator = await this.reloadly.getApi<Provider>(
      urlWithISO,
      AudienceType.Airtime,
    );

    if (iso == 'NG' && operator.suggestedAmounts.length > 0) {
      const { suggestedAmounts, ...rest } = operator;
      return {
        ...rest,
        suggestedAmounts: this.suggestedAmounts(),
      };
    }

    return operator;
  }

  async listProvidersByISO(
    iso: string,
    suggestedAmountsMap: boolean,
    suggestedAmounts: boolean,
    includePin: boolean,
    dataOnly: boolean,
    includeData: boolean,
  ) {
    const url = this.reloadly.getUrl(
      AudienceType.Airtime,
      reloadlyPath.countryOperators(iso),
    );

    let mappedOptions = Object.fromEntries(
      Object.entries({
        suggestedAmountsMap,
        suggestedAmounts,
        includePin,
        dataOnly,
        includeData,
      }),
    );

    const queryParams = new URLSearchParams(
      mappedOptions as unknown as Record<string, string>,
    ).toString();
    const urlWithISO = `${url}?${queryParams}`;

    const response = await this.reloadly.getApi<Provider[]>(
      urlWithISO,
      AudienceType.Airtime,
      {
        headers: {
          Accept: 'application/com.reloadly.topups-v1+json',
        },
      },
    );

    const operators = response.map((op) => {
      if (
        op.country.isoName.toLowerCase() === 'ng' &&
        op.denominationType === 'RANGE'
      ) {
        op.suggestedAmounts = generateUniqueRandomArray(
          op.minAmount,
          op.maxAmount,
          8,
        );
      }
      return op;
    });

    return operators;
  }

  async listAllTopupProviders() {
    const url = this.reloadly.getUrl(
      AudienceType.Airtime,
      reloadlyPath.operators,
    );
    const options = {
      suggestedAmountsMap: true,
      suggestedAmounts: true,
      includePin: true,
      includeBundles: true,
      includeData: true,
      includeCombo: true,
      size: 1000,
    };

    const queryParams = new URLSearchParams(
      options as unknown as Record<string, string>,
    ).toString();
    const urlWithISO = `${url}?${queryParams}`;
    const operators = await this.reloadly.getApi<PaginatedProviderList>(
      urlWithISO,
      AudienceType.Airtime,
    );
    return operators;
  }

  async generateBillTransaction(payload: CreateBillDto) {
    try {
      const {
        userId,
        billType,
        amount,
        providerName,
        provider,
        logoUrl,
        isoCode,
        phoneNumber,
        token,
        currencySymbol,
      } = payload;

      const { rate, base, target } = await this.exchangeService.getExchangeRate(
        currencySymbol.toUpperCase(),
        'USD',
      );
      const feePerc = getPercentage(rate.conversion_rate, 0.5);
      const usdValue = (feePerc + rate.conversion_rate) * Number(amount);

      const customIdentifier = generateId({ length: 16 });

      const billPayload = {
        user: userId as unknown as User,
        billType: billType,
        amount: parseFloat(amount),
        reference: customIdentifier,
      };
      const newBill = await this.billService.create(billPayload);

      const topUpPayload = {
        bill: newBill._id.toString() as unknown as Bill,
        provider: {
          name: providerName,
          providerId: provider,
          logoUrl: logoUrl,
        },
        processedBy: userId as unknown as User,
        recipient: {
          countryCode: isoCode,
          number: phoneNumber,
        },
        localAmount: parseFloat(amount),
        reference: customIdentifier,
      };

      switch (billType) {
        case BillType.AIRTIME: {
          await this.airtimeService.create(topUpPayload);
        }
      }

      const txPayload = {
        userId: userId,
        billId: newBill._id.toString(),
        amount: parseFloat(amount),
        currencySymbol,
        type: TxType.BILL_PAYMENT,
        paymentMethod: PaymentMethods.CRYPTO,
        tokenAddress: token,
        description: `${providerName.split(' ')[0]} ${this.desc[billType]}`,
        amountInUsd: parseFloat(usdValue.toFixed(2)),
      };
      const transaction = await this.txService.create(txPayload);
      console.log(txPayload);
    } catch (error) {
      console.error('Error generating bill transaction:', error);
      throw new Error('Failed to generate bill transaction.');
    }
  }

  suggestedAmounts() {
    return [500, 1000, 2000, 5000, 10000, 20000];
  }

  selectAirtimeProvider(data: SelectProvider) {
    console.log('SELECT AIRTIME PROVIDER');
    const { providers, inputedProviderName, isoCode } = data;

    const selectedProvider = providers.filter(
      (p) =>
        p.data === false &&
        p.bundle === false &&
        (p.pin
          ? p.denominationType === 'FIXED'
          : p.denominationType === 'RANGE') &&
        p.country.isoName.toLowerCase() === isoCode.toLowerCase() &&
        p.name
          .toLowerCase()
          .includes(inputedProviderName.split(' ')[0].toLowerCase()),
    );
    console.log(`Found ${selectedProvider.length} matching provider(s)`);

    // If no providers were found, return all airtime providers for the country
    if (selectedProvider.length === 0) {
      console.log(
        'No specific provider found. Returning all airtime providers for the country.',
      );
      return {
        selectedProvider: providers.filter(
          (provider) =>
            provider.bundle === false &&
            provider.data === false &&
            (provider.pin
              ? provider.denominationType === 'FIXED'
              : provider.denominationType === 'RANGE') &&
            isoCode &&
            provider.country.isoName.toLowerCase() === isoCode.toLowerCase(),
        ),
      };
    }

    return { selectedProvider };
  }

  selectMobileDataProvider(data: SelectProvider) {
    console.log('SELECT MOBILE DATA PROVIDER');
    const { providers, inputedProviderName, isoCode } = data;

    const selectedProvider = providers.filter(
      (p) =>
        p.data === true &&
        p.denominationType === 'FIXED' &&
        p.country.isoName.toLowerCase() === isoCode.toLowerCase() &&
        p.name
          .toLowerCase()
          .includes(inputedProviderName.split(' ')[0].toLowerCase()),
    );
    console.log(`Found ${selectedProvider.length} matching provider(s)`);

    // If no providers were found, return all data providers for the country
    if (selectedProvider.length === 0) {
      console.log(
        'No specific provider found. Returning all data providers for the country.',
      );
      return {
        selectedProvider: providers.filter(
          (provider) =>
            provider.denominationType === 'FIXED' &&
            provider.data === true &&
            isoCode &&
            provider.country.isoName.toLowerCase() === isoCode.toLowerCase(),
        ),
      };
    }

    return { selectedProvider };
  }
}
