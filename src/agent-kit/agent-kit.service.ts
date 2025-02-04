import { Injectable } from '@nestjs/common';
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

const MODIFIER = `
    You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
    empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
    faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
    funds from the user. Before executing your first action, get the wallet details to see what network 
    you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
    asks you to do something you can't do with your currently available tools, you must say so, and 
    encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
    docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
    restating your tools' descriptions unless it is explicitly requested.
`;

@Injectable()
export class AgentKitService {
  private agentCache: LRUCache<string, any>;
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
  }

  private createLLM() {
    return new ChatOpenAI({
      model: 'gpt-4o-mini',
      apiKey: this.configKeys.openaiKey,
    });
  }

  private async createUserAgent(user_id: string) {
    const { seedPhrase } = await this.walletService.getUserWallet(user_id);

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
        cdpWalletActionProvider({
          apiKeyName: cdpConfig.apiKeyName,
          apiKeyPrivateKey: cdpConfig.apiKeyPrivateKey,
        }),
        this.action.payBills,
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
      if ('agent' in chunk) output += chunk.agent.messages[0].content + '\n';
      if ('tools' in chunk) output += chunk.tools.messages[0].content;
    }

    return output;
  }
}
