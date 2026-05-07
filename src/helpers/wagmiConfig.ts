import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'
import { base } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { coinbaseWallet, injected } from 'wagmi/connectors'

const BASE_RPC_URL =
  import.meta.env['VITE_BASE_RPC_URL'] || 'https://mainnet.base.org'

export default createConfig({
  chains: [base],
  connectors: [
    farcasterMiniApp(),
    injected(),
    coinbaseWallet({
      appName: 'Eggs',
    }),
  ],
  transports: {
    [base.id]: http(BASE_RPC_URL),
  },
})
