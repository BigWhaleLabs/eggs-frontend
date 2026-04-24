import { JsonRpcProvider } from '@ethersproject/providers'
import { ChainId } from '@uniswap/sdk-core'
import { AlphaRouter } from '@uniswap/smart-order-router'

export const ROUTER_BASE_ADDRESS = '0x2626664c2603336E57B271c5C0b26F421741e481'

const baseRpcUrl = import.meta.env['VITE_BASE_RPC_URL']

if (!baseRpcUrl) {
  throw new Error('Missing VITE_BASE_RPC_URL')
}

const provider = new JsonRpcProvider(baseRpcUrl, ChainId.BASE)

const router = new AlphaRouter({
  chainId: 8453,
  provider,
})

export default router
