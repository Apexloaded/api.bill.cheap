import { Injectable } from '@nestjs/common';
import { ContractClient } from '../contract.client';


@Injectable()
export class PaymasterService {
  constructor(private client: ContractClient) {}

}
