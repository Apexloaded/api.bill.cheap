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
  CdpWalletProviderConfig,
} from '@coinbase/agentkit';
import { getLangChainTools } from '@coinbase/agentkit-langchain';
import { HumanMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { StructuredTool } from '@langchain/core/tools';
import { AgentKitAction } from './agent-kit.action';

type CdpConfig = CdpWalletProviderConfig & {
  cdpWalletData?: string;
  mnemonicPhrase?: string;
};

@Injectable()
export class AgentKitService implements OnModuleInit {
  private agentKit: AgentKit;
  private agentWalletFileName: string;
  private walletData: string | null;
  private cdpConfig: CdpConfig;
  private cdpApiName: string;
  private cpdApiKey: string;
  private llm: ChatOpenAI<ChatOpenAICallOptions>;
  private tools: StructuredTool[];

  constructor(
    private readonly config: ConfigService,
    private readonly action: AgentKitAction,
  ) {
    this.cdpApiName = this.config.get('cdp.apiName');
    this.cpdApiKey = this.config.get('cdp.apiKey')?.replace(/\\n/g, '\n');
    this.agentWalletFileName = 'agent-wallet.json';

    this.llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      apiKey: this.config.get('openai.apiKey'),
    });

    this.walletData = fs.existsSync(this.agentWalletFileName)
      ? fs.readFileSync(this.agentWalletFileName, 'utf-8')
      : null;

    this.cdpConfig = {
      apiKeyName: this.cdpApiName,
      apiKeyPrivateKey: this.cpdApiKey,
      cdpWalletData: this.walletData,
      networkId: this.config.get('cdp.networkId'),
    };
  }

  async onModuleInit() {
    try {
      // Configure CDP Wallet Provider
      const walletProvider = await CdpWalletProvider.configureWithWallet(
        this.cdpConfig,
      );

      // Initialize AgentKit
      this.agentKit = await AgentKit.from({
        walletProvider,
        actionProviders: [
          wethActionProvider(),
          pythActionProvider(),
          walletActionProvider(),
          erc20ActionProvider(),
          cdpApiActionProvider({
            apiKeyName: this.cdpApiName,
            apiKeyPrivateKey: this.cpdApiKey,
          }),
          cdpWalletActionProvider({
            apiKeyName: this.cdpApiName,
            apiKeyPrivateKey: this.cpdApiKey,
          }),
          this.action.customSignMessage,
          this.action.payBills,
        ],
      });
      this.tools = await getLangChainTools(this.agentKit);

      // await this.prompt('Process 100 naira worth of MTN airtime topup for 08142814191.');
      // await this.prompt("Sign this message, Hello world right here");
      //   await this.prompt(
      //     'Develop and deploy a memecoin token called CDPA using bonding curve on base-sepolia network and display relevant information on the screen',
      //   );

      // Save wallet data
      const exportedWallet = await walletProvider.exportWallet();
      fs.writeFileSync(
        this.agentWalletFileName,
        JSON.stringify(exportedWallet),
      );
    } catch (error) {}
  }

  get agent() {
    // Create React Agent using the LLM and CDP AgentKit tools
    const memory = new MemorySaver();
    return createReactAgent({
      llm: this.llm,
      tools: this.tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
        faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
        funds from the user. Before executing your first action, get the wallet details to see what network 
        you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
        asks you to do something you can't do with your currently available tools, you must say so, and 
        encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
        docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
        restating your tools' descriptions unless it is explicitly requested.
        `,
    });
  }

  async prompt(input: string) {
    console.log(input);
    const config = {
      configurable: { thread_id: 'CDP AgentKit Chatbot Example!' },
    };
    const stream = await this.agent.stream(
      { messages: [new HumanMessage(input)] },
      config,
    );

    // Print the responses from the AgentKit and CDP tools to the console.
    for await (const chunk of stream) {
      console.log(chunk);
      if ('agent' in chunk) {
        const response = chunk.agent.messages[0].content;
        console.log(response);
        //return response;
      } else if ('tools' in chunk) {
        const response = chunk.tools.messages[0].content;
        console.log(response);
        //return response;
      }
      console.log('-------------------');
    }
  }
}
