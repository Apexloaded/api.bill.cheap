import { BaseBillCheapAction } from '@/agent-kit/interfaces/agent-kit.interface';
import { TopUpProvider } from '@/bill/topup/topup.provider';

export interface BillcheapActionProviderConfig extends BaseBillCheapAction {
  provider?: TopUpProvider;
}
