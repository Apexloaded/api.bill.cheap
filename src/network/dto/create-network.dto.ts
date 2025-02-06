import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { NetworkType } from '../entities/network.entity';

export class CreateNetworkDto {
  @IsString()
  chainId: string;

  @IsString()
  symbol: string;

  @IsString()
  name: string;

  @IsString()
  shortName: string;

  @IsOptional()
  rpcUrl?: string;

  @IsOptional()
  rpcId?: string;

  @IsOptional()
  wssUrl?: string;

  @IsString()
  explorerUrl: string;

  @IsBoolean()
  isEnabled: boolean;

  @IsEnum(NetworkType)
  type: NetworkType;

  @IsString()
  icon: string;
}
