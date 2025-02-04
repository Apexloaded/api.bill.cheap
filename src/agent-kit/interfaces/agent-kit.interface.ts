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
