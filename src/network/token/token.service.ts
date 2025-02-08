import { Injectable } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from './entities/token.entity';
import { FilterQuery, Model } from 'mongoose';
import { GatewayService } from '@/contract/gateway/gateway.service';
import { ExchangeService } from '@/exchange/exchange.service';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private model: Model<Token>,
    private gateway: GatewayService,
    private exchange: ExchangeService,
  ) {}
  create(createTokenDto: CreateTokenDto) {
    return this.model.create(createTokenDto);
  }

  batchCreate(createTokenDto: CreateTokenDto[]) {
    return this.model.insertMany(createTokenDto);
  }

  findAll(filter?: FilterQuery<Token>) {
    return this.model.find(filter);
  }

  findOne(filter: FilterQuery<Token>) {
    return this.model.findOne(filter);
  }

  async queryBalance(address: `0x${string}`) {
    const tokens = await this.findAll();
    const balances = await this.gateway.getAccountBalance(tokens, address);
    const priceIds = balances.map((b) => b.aggregator);
    const usdRates = await this.exchange.getCryptoUsdRates(priceIds);

    // Format the price with USD symbol and commas for thousands
    const usdBalanceMap = new Map(usdRates.map((usd) => [usd.id, usd]));
    balances.forEach((balance) => {
      const usdBalance = usdBalanceMap.get(balance.aggregator);
      if (usdBalance) {
        const usdValue =
          Number(balance.balance) * Number(usdBalance.currentPrice);
        balance.usdValue = `${usdValue}`;
        balance.fxRate = usdBalance;
      }
    });

    
    return balances;
  }
}
