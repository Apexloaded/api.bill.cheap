export const walletSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Billcheap Wallet',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        format: 'uuid',
        coerce: true,
      },
      salt: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      wallet: {
        type: 'string',
      },
    },
    required: ['_id', 'salt', 'wallet'],
    additionalProperties: false,
  },
} as const;

export interface ApiResponse {
  success: boolean;
  results: WalletResult[];
}

export interface WalletResult {
  data: WalletDataEntry[];
}

export interface WalletDataEntry {
  _id: string;
  salt: string[];
  wallet: string;
  _created: string;
  _updated: string;
}
