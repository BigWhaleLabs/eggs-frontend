import { useQuery } from '@tanstack/react-query'
import eggsContractAbi from 'helpers/eggsContractAbi'
import { graphql } from 'helpers/graphql'
import { useCallback } from 'preact/hooks'
import { erc20Abi } from 'viem'
import { base } from 'viem/chains'
import { useReadContracts } from 'wagmi'
import useURQLClient from './useURQLClient'

export const getMyWallets = graphql(`
  query getMyData {
    getMe {
      id
      connectedWallets
    }
  }
`)

export default function useEggsHoldings() {
  const client = useURQLClient()
  const fetchWallets = useCallback(
    () => client.query(getMyWallets, {}).toPromise(),
    [client]
  )
  const { data, isLoading: isLoadingWallets } = useQuery({
    queryKey: ['wallets'],
    queryFn: fetchWallets,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

  // Fetch egg balance and stake for each wallet
  const wallets = (data?.data?.getMe.connectedWallets || []) as `0x${string}`[]

  // Use useReadContracts for wallet balances
  const { data: balances, isLoading: isLoadingBalances } = useReadContracts({
    contracts: wallets.map((address) => ({
      address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150' as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address],
      chainId: base.id,
    })),
  })

  // Use useReadContracts for staked amounts with simplified approach
  const { data: stakingData, isLoading: isLoadingStakes } = useReadContracts({
    contracts: wallets.map((address) => ({
      address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150' as `0x${string}`,
      abi: eggsContractAbi,
      functionName: 'stakeOf',
      args: [address],
      chainId: base.id,
    })),
  })
  const stakes = stakingData as
    | (
        | {
            error: Error
            result?: undefined
            status: 'failure'
          }
        | {
            error?: undefined
            result: string | number | bigint
            status: 'success'
          }
      )[]
    | undefined

  // Build the return data structure with total holdings
  const isDataLoading = isLoadingBalances || isLoadingStakes
  const balanceResults = balances || []
  const stakeResults = stakes || []

  const eggBalances = wallets.map((address, index) => {
    // Get wallet balance with type bypass
    let walletBalance = 0n
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const balanceItem = balanceResults[index] as any
      if (balanceItem?.result && typeof balanceItem.result === 'bigint') {
        walletBalance = balanceItem.result
      }
    } catch {
      // Fallback to 0n
    }

    // Get staked balance with type bypass
    let stakedBalance = 0n
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stakeItem = stakeResults[index] as any
      if (stakeItem?.result && typeof stakeItem.result === 'bigint') {
        stakedBalance = stakeItem.result
      }
    } catch {
      // Fallback to 0n
    }

    // Return total holdings (wallet balance + staked balance)
    return {
      address,
      eggsBalance: walletBalance + stakedBalance, // Total holdings (balance + stake)
      isLoading: isDataLoading,
    }
  })

  return {
    isLoading: isLoadingBalances || isLoadingWallets || isLoadingStakes,
    eggBalances,
  }
}
