import { FindUtilitySchema } from '@/agent-kit/actions/utility/schemas/utility.schema';
import { AudienceType, reloadlyPath } from '@/enums/reloadly.enum';
import { ReloadlyService } from '@/reloadly/reloadly.service';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { PaginatedProviderList } from '../types/provider.type';
import { UtitliyOperators } from './types/utility.type';
import { TransactionService } from '@/transaction/transaction.service';
import { TokenService } from '@/network/token/token.service';
import { ExchangeService } from '@/exchange/exchange.service';
import { UtilityService } from './utility.service';
import {
  UtilityBodyRequest,
  UtilityBodyResponse,
  UtilityStatusResponse,
} from './dto/create-utility.dto';

@Injectable()
export class UtilityProvider {
  private readonly logger = new Logger(UtilityProvider.name);

  constructor(
    private readonly reloadly: ReloadlyService,
    private readonly utilityService: UtilityService,
  ) {}

  async listAllProviders(filter: z.infer<typeof FindUtilitySchema>) {
    const url = this.reloadly.getUrl(
      AudienceType.Utilities,
      reloadlyPath.billers,
    );
    const { isForeignTx, isLocal, ...options } = filter;
    const cleanedOptions = Object.fromEntries(
      Object.entries({ ...options, size: 100 }).filter(
        ([_, value]) => value !== undefined && value !== null && value !== '',
      ),
    );

    const queryParams = new URLSearchParams(
      cleanedOptions as unknown as Record<string, string>,
    ).toString();

    const urlWithISO = `${url}?${queryParams}`;
    console.log(urlWithISO);
    const operators = await this.reloadly.getApi<
      PaginatedProviderList<UtitliyOperators>
    >(urlWithISO, AudienceType.Utilities);
    return operators.content;
  }

  async processTopUp(billId: string, useLocalAmount: boolean) {
    const utility = await this.utilityService.findOne({ bill: billId });
    if (!utility) return;

    const payload = {
      amount: utility.amount,
      amountId: utility.amountId,
      billerId: utility.provider.providerId,
      referenceId: utility.reference,
      customIdentifier: utility.reference,
      subscriberAccountNumber: utility.recipient.accountNumber,
      useLocalAmount,
    };
    const reqUrl = this.reloadly.getUrl(
      AudienceType.Utilities,
      reloadlyPath.pay,
    );
    const utilityReqRes = await this.reloadly.postApi<
      UtilityBodyRequest,
      UtilityBodyResponse
    >(reqUrl, AudienceType.Utilities, payload);
    this.logger.log('TopUp Response', utilityReqRes);

    // Query airtime status
    const queryTxUrl = this.reloadly.getUrl(
      AudienceType.Utilities,
      reloadlyPath.transactions,
    );
    const statusRes = await this.reloadly.getApi<UtilityStatusResponse>(
      queryTxUrl,
      AudienceType.Utilities,
    );
    this.logger.log('Status Response', statusRes);

    return { status: statusRes, body: utilityReqRes };
  }
}
