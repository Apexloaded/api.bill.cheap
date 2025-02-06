import { IsArray, IsString } from 'class-validator';

export class CreateTokenDto {
  @IsArray()
  chainId: string[];

  @IsString()
  address: string;

  @IsString()
  aggregator: string;

  @IsString()
  name: string;

  @IsString()
  symbol: string;

  @IsString()
  icon: string;
}
