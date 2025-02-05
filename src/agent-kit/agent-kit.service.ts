import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
} from '@coinbase/agentkit';
import { getLangChainTools } from '@coinbase/agentkit-langchain';
import { HumanMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { AgentKitAction } from './agent-kit.action';
import { LRUCache } from 'lru-cache';
import { AgentPrompt, CdpConfig } from './interfaces/agent-kit.interface';
import { WalletService } from '@/wallet/wallet.service';
import MODIFIER from './modifiers/billing.modifier';
import { billcheapActionProvider } from './actions/billcheap/billcheap.action';
import { BillProvider } from '@/bill/bill.provider';
import { AnnotationRoot } from '@langchain/langgraph/dist/graph/annotation';
import * as fs from 'fs';
import { GatewayService } from '@/contract/gateway/gateway.service';

export type ReactAgent<
  A extends AnnotationRoot<any> = AnnotationRoot<{}>,
  StructuredResponseFormat extends Record<string, any> = Record<string, any>,
> = ReturnType<typeof createReactAgent<A, StructuredResponseFormat>>;
@Injectable()
export class AgentKitService {
  private topUpDataSourceFile: string;
  private topUpData: string | null = null;
  private dataSource: string;
  private agentCache: LRUCache<string, ReactAgent>;
  private configKeys: {
    apiName: string;
    apiKey: string;
    networkId: string;
    openaiKey: string;
  };

  constructor(
    private readonly config: ConfigService,
    private readonly action: AgentKitAction,
    private readonly walletService: WalletService,
    private billProvider: BillProvider,
    private gateway: GatewayService,
  ) {
    this.configKeys = {
      apiName: this.config.get('cdp.apiName'),
      apiKey: this.config.get('cdp.apiKey')?.replace(/\\n/g, '\n'),
      networkId: this.config.get('cdp.networkId'),
      openaiKey: this.config.get('openai.apiKey'),
    };

    this.agentCache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 60,
      updateAgeOnGet: true,
    });
    this.dataSource = MODIFIER;
    this.topUpDataSourceFile = 'top-up-data-source.json';
  }

  private createLLM() {
    return new ChatOpenAI({
      model: 'gpt-4o-mini',
      apiKey: this.configKeys.openaiKey,
    });
  }

  private async createUserAgent(user_id: string) {
    const { seedPhrase, user } =
      await this.walletService.getUserWallet(user_id);

    const cdpConfig: CdpConfig = {
      apiKeyName: this.configKeys.apiName,
      apiKeyPrivateKey: this.configKeys.apiKey,
      networkId: this.configKeys.networkId,
      mnemonicPhrase: seedPhrase,
    };

    const walletProvider =
      await CdpWalletProvider.configureWithWallet(cdpConfig);
    const agentKit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        wethActionProvider(),
        pythActionProvider(),
        walletActionProvider(),
        erc20ActionProvider(),
        cdpApiActionProvider({
          apiKeyName: cdpConfig.apiKeyName,
          apiKeyPrivateKey: cdpConfig.apiKeyPrivateKey,
        }),
        billcheapActionProvider({
          userId: user_id,
          billProvider: this.billProvider,
          gateway: this.gateway,
        }),

        // this.action.processTopupActionProvider({
        //   id: user_id,
        //   walletAddress: user.wallet,
        //   phone: user.phone,
        // }),
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
