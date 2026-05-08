import { sdk as miniAppSdk } from '@farcaster/miniapp-sdk'
import { getAddress, isAddress } from 'viem'

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export async function getMiniAppEthereumProvider() {
  return (await miniAppSdk.wallet.getEthereumProvider()) as
    | EthereumProvider
    | undefined
}

export async function getMiniAppWalletAddress() {
  const provider = await getMiniAppEthereumProvider()
  const accounts = await provider?.request({ method: 'eth_accounts' })

  if (!Array.isArray(accounts)) return null

  const account = accounts.find(
    (item): item is string => typeof item === 'string' && isAddress(item)
  )

  return account ? getAddress(account) : null
}

export async function getMiniAppQuickAuthFetchOptions(isInMiniApp: boolean) {
  if (!isInMiniApp) return undefined

  const { token } = await miniAppSdk.quickAuth.getToken()

  return {
    fetchOptions: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  }
}
