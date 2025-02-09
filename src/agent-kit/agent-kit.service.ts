import { Injectable } from '@nestjs/common';
import {
  AgentKit,
  walletActionProvider,
  erc20ActionProvider,
  pythActionProvider,
  ViemWalletProvider,
} from '@coinbase/agentkit';
import { getLangChainTools } from '@coinbase/agentkit-langchain';
import { HumanMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { LRUCache } from 'lru-cache';
import { AgentPrompt } from './interfaces/agent-kit.interface';
import { WalletService } from '@/wallet/wallet.service';
import MODIFIER from './modifiers/billing.modifier';
import { billcheapTopupActionProvider } from './actions/topup/topup.action';
import { BillProvider } from '@/bill/bill.provider';
import { AnnotationRoot } from '@langchain/langgraph/dist/graph/annotation';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, Hex, http } from 'viem';
import { getAppChain } from '@/utils/helpers';
import { GatewayService } from '@/contract/gateway/gateway.service';
import { bcUtitliyActionProvider } from './actions/utility/utility.action';
import { UtilityProvider } from '@/bill/utility/utility.provider';
import { TopUpProvider } from '@/bill/topup/topup.provider';

export type ReactAgent<
  A extends AnnotationRoot<any> = AnnotationRoot<{}>,
  StructuredResponseFormat extends Record<string, any> = Record<string, any>,
> = ReturnType<typeof createReactAgent<A, StructuredResponseFormat>>;
@Injectable()
export class AgentKitService {
  private agentCache: LRUCache<string, ReactAgent>;
  private configKeys: {
    apiName: string;
    apiKey: string;
    networkId: string;
    openaiKey: string;
    rpc: string;
  };

  constructor(
    private readonly config: ConfigService,
    private readonly walletService: WalletService,
    private topUpProvider: TopUpProvider,
    private gateway: GatewayService,
    private utitliyProvider: UtilityProvider,
    private billProvider: BillProvider,
  ) {
    this.configKeys = {
      apiName: this.config.get('cdp.apiName'),
      apiKey: this.config.get('cdp.apiKey')?.replace(/\\n/g, '\n'),
      networkId: this.config.get('cdp.networkId'),
      openaiKey: this.config.get('openai.apiKey'),
      rpc: this.config.get('app.rpc'),
    };

    this.agentCache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 60,
      updateAgeOnGet: true,
    });
  }

  private createLLM() {
    return new ChatOpenAI({
      model: 'gpt-4o-mini',
      apiKey: this.configKeys.openaiKey,
    });
  }

  private async createUserAgent(user_id: string) {
    const { wallet } = await this.walletService.getUserWallet(user_id);
    const account = privateKeyToAccount(wallet.privateKey as Hex);
    const client = createWalletClient({
      account,
      chain: getAppChain,
      transport: http(this.configKeys.rpc),
    });
    const walletProvider = new ViemWalletProvider(client);

    const agentKit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        pythActionProvider(),
        walletActionProvider(),
        erc20ActionProvider(),
        billcheapTopupActionProvider({
          userId: user_id,
          provider: this.topUpProvider,
          gateway: this.gateway,
          billProvider: this.billProvider,
        }),
        bcUtitliyActionProvider({
          userId: user_id,
          provider: this.utitliyProvider,
          gateway: this.gateway,
          billProvider: this.billProvider,
        }),
      ],
    });

    const tools = await getLangChainTools(agentKit);
    return { agentKit, tools, walletProvider };
  }

  async getUserAgent(userId: string) {
    const cacheKey = userId;
    const cachedAgent = this.agentCache.get(cacheKey);

    if (cachedAgent) return cachedAgent;

    const { tools } = await this.createUserAgent(userId);
    const memory = new MemorySaver();
    const agent = createReactAgent({
      llm: this.createLLM(),
      tools,
      checkpointSaver: memory,
      messageModifier: MODIFIER,
    });

    this.agentCache.set(cacheKey, agent);
    return agent;
  }

  async prompt(data: AgentPrompt) {
    let { prompt, thread_id, user_id } = data;
    const agent = await this.getUserAgent(user_id);

    const stream = await agent.stream(
      { messages: [new HumanMessage(prompt)] },
      { configurable: { thread_id } },
    );

    let output = '';
    for await (const chunk of stream) {
      if ('agent' in chunk) {
        output += chunk.agent.messages[0].content + '\n';
      }
    }
    return output;
  }
}
