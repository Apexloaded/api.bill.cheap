import { BaseBillCheapAction } from '@/agent-kit/interfaces/agent-kit.interface';
import { UtilityProvider } from '@/bill/utility/utility.provider';

export interface BCUtilityActionConfig extends BaseBillCheapAction {
  provider?: UtilityProvider;
}
