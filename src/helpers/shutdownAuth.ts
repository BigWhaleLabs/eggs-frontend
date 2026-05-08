import { getAddress } from 'viem'

export function getShutdownAuthorizationMessage(address: `0x${string}`) {
  return [
    'Eggs shutdown authorization',
    '',
    `Wallet: ${getAddress(address)}`,
  ].join('\n')
}
