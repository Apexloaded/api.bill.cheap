import { Injectable, Logger } from '@nestjs/common';
import { ReloadlyService } from '@/reloadly/reloadly.service';
import { AudienceType, reloadlyPath } from '@/enums/reloadly.enum';
import {
  TopUpBodyRequest,
  TopUpBodyResponse,
  TopUpStatusResponse,
} from './dto/create-topup.dto';
import { TopUpService } from './topup.service';

@Injectable()
export class TopUpProcessor {
  private readonly logger = new Logger(TopUpProcessor.name);

  constructor(
    private readonly topUpService: TopUpService,
    private readonly reloadly: ReloadlyService,
  ) {}

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
      AudienceType.Airtime,
      reloadlyPath.topUp,
    );
    const airtimeRes = await this.reloadly.postApi<
      TopUpBodyRequest,
      TopUpBodyResponse
    >(reqUrl, AudienceType.Airtime, payload);
    this.logger.log('TopUp Response', airtimeRes);

    // Query airtime status
    const statusUrl = this.reloadly.getUrl(
      AudienceType.Airtime,
      reloadlyPath.topUpStatus(airtimeRes.transactionId.toString()),
    );
    const statusRes = await this.reloadly.getApi<TopUpStatusResponse>(
      statusUrl,
      AudienceType.Airtime,
    );
    this.logger.log('Status Response', statusRes);

    return statusRes;
  }
}
