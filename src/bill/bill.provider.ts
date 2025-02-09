import { ReloadlyService } from '@/reloadly/reloadly.service';
import { Injectable } from '@nestjs/common';
import { CreateBillDto } from './dto/create-bill.dto';
import { generateId, getPercentage, to0xString } from '@/utils/helpers';
import { BillService } from './bill.service';
import { User } from '@/user/entities/user.entity';
import { Bill, BillType } from './entities/bill.entity';
import { TopUpService } from './topup/topup.service';
import { ExchangeService } from '@/exchange/exchange.service';
import { TransactionService } from '@/transaction/transaction.service';
import {
  PaymentMethods,
  TxType,
} from '@/transaction/entities/transaction.entity';
import { toHex } from 'viem';
import { ContractBillType, ContractTxType } from '@/enums/contract.enum';
import { TokenService } from '@/network/token/token.service';
import { InitBill } from './types/init-bill.type';
import { UtilityService } from './utility/utility.service';

@Injectable()
export class BillProvider {
  private desc = {
    [BillType.AIRTIME]: 'Airtime Topup',
    [BillType.MOBILE_DATA]: 'Mobile Data',
    [BillType.ELECTRICITY]: 'Electricity',
    [BillType.CABLE_TV]: 'Cable TV',
    [BillType.WATER]: 'Water',
    [BillType.INTERNET]: 'Internet',
  };

  constructor(
    private readonly reloadly: ReloadlyService,
    private billService: BillService,
    private topUpService: TopUpService,
    private utilityService: UtilityService,
    private exchangeService: ExchangeService,
    private txService: TransactionService,
    private tokenService: TokenService,
  ) {}

  async generateBillTransaction(payload: CreateBillDto): Promise<InitBill> {
    try {
      const {
        userId,
        billType,
        amount,
        providerName,
        provider,
        token,
        currencySymbol,
      } = payload;

      const selectedToken = await this.tokenService.findOne({
        address: { $regex: token, $options: 'i' },
      });

      if (!selectedToken) {
        throw new Error('Invalid token address.');
      }

      const usdValue = await this.verifyBalance(
        amount,
        currencySymbol.toUpperCase(),
      );
      const [cryptoRate] = await this.exchangeService.getCryptoUsdRates([
        selectedToken.aggregator,
      ]);
      const cryptoValue = usdValue / parseFloat(cryptoRate.currentPrice);

      const customIdentifier = generateId({ length: 16 });
      const billPayload = {
        user: userId as unknown as User,
        billType: billType,
        amount: parseFloat(amount),
        reference: customIdentifier,
        useLocalAmount: currencySymbol.toLowerCase() !== 'ngn',
        currency: currencySymbol,
      };
      const newBill = await this.billService.create(billPayload);

      await this.determineBill({
        ...payload,
        bill: newBill._id.toString(),
        referenceId: customIdentifier,
      });

      const txPayload = {
        userId: userId,
        billId: newBill._id.toString(),
        amount: parseFloat(amount),
        currency: currencySymbol,
        type: TxType.BILL_PAYMENT,
        paymentMethod: PaymentMethods.CRYPTO,
        tokenAddress: token,
        description: `${providerName.split(' ')[0]} ${this.desc[billType]}`,
        amountInUsd: parseFloat(usdValue.toFixed(2)),
      };
      const transaction = await this.txService.create(txPayload);

      const response = {
        transactionId: toHex(transaction._id.toString()),
        billType: ContractBillType[billType],
        billId: toHex(newBill._id.toString()),
        tokenAddress: token,
        transactionType: ContractTxType.BillPayment,
        providerId: toHex(provider),
        cryptoValue,
      };
      return response;
    } catch (error) {
      console.error('Error generating bill transaction:', error);
      throw new Error('Failed to generate bill transaction.');
    }
  }

  async listPaymentTokens(address: string) {
    const tokens = await this.tokenService.queryBalance(to0xString(address));
    return tokens.map((t) => {
      return {
        address: t.address,
        balanceInEth: t.balance,
        balanceInUsd: t.usdValue,
        name: t.name,
        symbol: t.symbol,
      };
    });
  }

  async verifyBalance(amount: string, currency) {
    const { rate } = await this.exchangeService.getExchangeRate(
      currency.toUpperCase(),
      'USD',
    );
    const feePerc = getPercentage(rate.conversion_rate, 0.5);
    const usdValue = (feePerc + rate.conversion_rate) * parseFloat(amount);
    return usdValue;
  }

  suggestedAmounts() {
    return [500, 1000, 2000, 5000, 10000, 20000];
  }

  private async determineBill(
    payload: CreateBillDto & { bill: string; referenceId: string },
  ) {
    if ([BillType.AIRTIME, BillType.MOBILE_DATA].includes(payload.billType)) {
      const topUpPayload = {
        bill: payload.bill as unknown as Bill,
        provider: {
          name: payload.providerName,
          providerId: payload.provider,
          logoUrl: payload.logoUrl,
        },
        processedBy: payload.userId as unknown as User,
        recipient: {
          countryCode: payload.isoCode,
          number: payload.phoneNumber,
        },
        amount: parseFloat(payload.amount),
        currency: payload.currencySymbol,
        reference: payload.referenceId,
      };
      await this.topUpService.create(topUpPayload);
    }

    if (
      [
        BillType.CABLE_TV,
        BillType.ELECTRICITY,
        BillType.INTERNET,
        BillType.WATER,
      ].includes(payload.billType)
    ) {
      const utilityPayload = {
        amountId: payload.amountId,
        additionalInfo: payload.additionalInfo,
        bill: payload.bill as unknown as Bill,
        provider: {
          name: payload.providerName,
          providerId: payload.provider,
          logoUrl: payload.logoUrl,
        },
        processedBy: payload.userId as unknown as User,
        recipient: {
          countryCode: payload.isoCode,
          accountNumber: payload.accountNumber,
        },
        amount: parseFloat(payload.amount),
        currency: payload.currencySymbol,
        reference: payload.referenceId,
      };
      await this.utilityService.create(utilityPayload);
    }
  }
}
