import { BillProvider } from '@/bill/bill.provider';
import { GatewayService } from '@/contract/gateway/gateway.service';
import { CdpWalletProviderConfig } from '@coinbase/agentkit';

export type CdpConfig = CdpWalletProviderConfig & {
  cdpWalletData?: string;
  mnemonicPhrase?: string;
};

export type AgentPrompt = {
  user_id: string;
  prompt: string;
  thread_id: string;
};

export type BaseBillCheapAction = {
  userId?: string;
  gateway?: GatewayService;
  billProvider?: BillProvider;
};
