import { useQuery } from '@tanstack/react-query'

async function fetchEggsInfo() {
  const baseUrl =
    'https://api.dexscreener.com/tokens/v1/base/0x712f43b21cf3e1b189c27678c0f551c08c01d150'
  const response = await fetch(baseUrl)
  const data = (await response.json()) as TokenPair[]
  return data
}

export function useEggsInfo() {
  const eggsData = useQuery({
    queryKey: ['eggsInfo'],
    queryFn: fetchEggsInfo,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  })

  const eggsInfo = eggsData.data?.[0] || undefined

  return eggsInfo
}

interface Token {
  address: string
  name: string
  symbol: string
}

interface TransactionCounts {
  buys: number
  sells: number
}

interface Transactions {
  m5: TransactionCounts
  h1: TransactionCounts
  h6: TransactionCounts
  h24: TransactionCounts
}

interface Volume {
  h24: number
  h6: number
  h1: number
  m5: number
}

interface PriceChange {
  m5: number
  h1: number
  h6: number
  h24: number
}

interface Liquidity {
  usd: number
  base: number
  quote: number
}

interface Website {
  label: string
  url: string
}

interface Social {
  type: string
  url: string
}

interface TokenInfo {
  imageUrl: string
  header: string
  openGraph: string
  websites: Website[]
  socials: Social[]
}

interface TokenPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  labels: string[]
  baseToken: Token
  quoteToken: Token
  priceNative: string
  priceUsd: string
  txns: Transactions
  volume: Volume
  priceChange: PriceChange
  liquidity: Liquidity
  fdv: number
  marketCap: number
  pairCreatedAt: number
  info: TokenInfo
}
