import { AudienceType, reloadlyPath } from '@/enums/reloadly.enum';
import { ReloadlyService } from '@/reloadly/reloadly.service';
import { Injectable, Logger } from '@nestjs/common';
import { PaginatedProviderList } from '@/bill/types/provider.type';
import { generateUniqueRandomArray } from '@/utils/helpers';
import {
  SelectTopUpProvider,
  TopUpOperator,
} from './types/topup-operator.type';
import { BillProvider } from '../bill.provider';
import { TopUpService } from './topup.service';
import { TopUpBodyRequest, TopUpBodyResponse, TopUpStatusResponse } from './dto/create-topup.dto';

@Injectable()
export class TopUpProvider {
  private readonly logger = new Logger(TopUpProvider.name);

  constructor(
    private readonly reloadly: ReloadlyService,
    private readonly billProvider: BillProvider,
    private readonly topUpService: TopUpService,
  ) {}

  async autoDetectProvider(phone: string, iso: string) {
    if (!phone || !iso) {
      throw new Error('Phone and ISO are required parameters.');
    }

    const url = this.reloadly.getUrl(
      AudienceType.Topups,
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
    const operator = await this.reloadly.getApi<TopUpOperator>(
      urlWithISO,
      AudienceType.Topups,
    );

    if (iso == 'NG' && operator.suggestedAmounts.length > 0) {
      const { suggestedAmounts, ...rest } = operator;
      return {
        ...rest,
        suggestedAmounts: this.billProvider.suggestedAmounts(),
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
      AudienceType.Topups,
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
    console.log(urlWithISO);
    const response = await this.reloadly.getApi<TopUpOperator[]>(
      urlWithISO,
      AudienceType.Topups,
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
      AudienceType.Topups,
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
    const operators = await this.reloadly.getApi<
      PaginatedProviderList<TopUpOperator>
    >(urlWithISO, AudienceType.Topups);
    return operators;
  }

  selectAirtimeProvider(data: SelectTopUpProvider) {
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

  determineAmountCurrency(
    provider: TopUpOperator,
    amount: number,
    isForeignTx: boolean,
  ): 'local' | 'foreign' {
    if (provider.denominationType === 'FIXED') {
      if (isForeignTx) {
        return provider.localFixedAmounts.includes(amount)
          ? 'local'
          : 'foreign';
      } else {
        return provider.fixedAmounts.includes(amount) ? 'foreign' : 'local';
      }
    } else {
      // RANGE
      if (isForeignTx) {
        return amount >= provider.localMinAmount &&
          amount <= provider.localMaxAmount
          ? 'local'
          : 'foreign';
      } else {
        return amount >= provider.minAmount && amount <= provider.maxAmount
          ? 'foreign'
          : 'local';
      }
    }
  }

  formatProvidersToAgentsData(providers: TopUpOperator[]) {
    return providers.map((p) => {
      return this.formatSingleProvider(p);
    });
  }

  formatSingleProvider(provider: TopUpOperator) {
    if (provider.destinationCurrencyCode.toLowerCase() !== 'ngn') {
      if (provider.denominationType === 'RANGE') {
        provider.minAmount = provider.localMinAmount;
        provider.maxAmount = provider.localMaxAmount;
        provider.suggestedAmounts = generateUniqueRandomArray(
          provider.localMinAmount,
          provider.localMaxAmount,
          8,
        );
        provider.mostPopularAmount = provider.suggestedAmounts.length[6];
      }
      if (provider.denominationType === 'FIXED') {
        provider.mostPopularAmount = provider.mostPopularLocalAmount;
        provider.fixedAmounts = provider.localFixedAmounts;
        provider.fixedAmountsDescriptions =
          provider.localFixedAmountsDescriptions;
      }
    }
    return provider;
  }

  selectMobileDataProvider(data: SelectTopUpProvider) {
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

  async processTopUp(billId: string, useLocalAmount: boolean) {
    const airtime = await this.topUpService.findOne({ bill: billId });
    if (!airtime) return;

    const payload = {
      operatorId: airtime.provider.providerId,
      amount: airtime.amount.toString(),
      customIdentifier: airtime.reference,
      recipientPhone: {
        countryCode: airtime.recipient.countryCode,
        number: airtime.recipient.number,
      },
      useLocalAmount,
    };
    const reqUrl = this.reloadly.getUrl(
      AudienceType.Topups,
      reloadlyPath.topUp,
    );
    const airtimeRes = await this.reloadly.postApi<
      TopUpBodyRequest,
      TopUpBodyResponse
    >(reqUrl, AudienceType.Topups, payload);
    this.logger.log('TopUp Response', airtimeRes);

    // Query airtime status
    const statusUrl = this.reloadly.getUrl(
      AudienceType.Topups,
      reloadlyPath.topUpStatus(airtimeRes.transactionId.toString()),
    );
    const statusRes = await this.reloadly.getApi<TopUpStatusResponse>(
      statusUrl,
      AudienceType.Topups,
    );
    this.logger.log('Status Response', statusRes);

    return statusRes;
  }
}
