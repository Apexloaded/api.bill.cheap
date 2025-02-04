const processBillAbi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'externalTxId',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'billId',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'providerId',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        internalType: 'enum TransactionType',
        name: 'txType',
        type: 'uint8',
      },
      {
        internalType: 'enum BillType',
        name: 'billType',
        type: 'uint8',
      },
    ],
    name: 'processBill',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export default processBillAbi;
