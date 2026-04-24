import { base } from 'viem/chains'
import { createConfig, http } from 'wagmi'

export default createConfig({
  chains: [base],
  transports: {
    [base.id]: http(import.meta.env['VITE_BASE_RPC_URL']),
  },
})
