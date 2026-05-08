export default [
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'vs',
        type: 'bytes32',
      },
    ],
    name: 'mintChicken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
