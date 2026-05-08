import { sdk as miniAppSdk } from '@farcaster/miniapp-sdk'
import { getAddress, isAddress } from 'viem'

const QUICK_AUTH_TOKEN_STORAGE_KEY = 'FarcasterQuickAuthToken'

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

type JwtPayload = {
  exp?: number
}

function decodeJwtPayload(token: string) {
  const payload = token.split('.')[1]
  if (!payload || typeof window === 'undefined') return null

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decodedPayload = window.atob(normalizedPayload)
    return JSON.parse(decodedPayload) as JwtPayload
  } catch {
    return null
  }
}

function getCachedQuickAuthToken() {
  if (typeof window === 'undefined') return null

  const token = window.sessionStorage.getItem(QUICK_AUTH_TOKEN_STORAGE_KEY)
  if (!token) return null

  const payload = decodeJwtPayload(token)
  if (!payload?.exp || payload.exp * 1000 <= Date.now() + 15_000) {
    window.sessionStorage.removeItem(QUICK_AUTH_TOKEN_STORAGE_KEY)
    return null
  }

  return token
}

async function getQuickAuthToken() {
  const cachedToken = getCachedQuickAuthToken()
  if (cachedToken) return cachedToken

  const { token } = await miniAppSdk.quickAuth.getToken()

  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(QUICK_AUTH_TOKEN_STORAGE_KEY, token)
  }

  return token
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

  const token = await getQuickAuthToken()

  return {
    fetchOptions: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  }
}
