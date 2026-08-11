import eggsContractAbi from 'helpers/eggsContractAbi'
import { getMiniAppWalletAddress } from 'helpers/farcasterMiniApp'
import { useCallback, useEffect, useState } from 'preact/hooks'
import toast from 'react-hot-toast'
import { erc20Abi, zeroAddress } from 'viem'
import { base } from 'viem/chains'
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from 'wagmi'
import ShutdownActionsView, { extractErrorMessage } from './ShutdownActionsView'

const EGGS_CONTRACT =
  '0x712f43B21cf3e1B189c27678C0f551c08c01D150' as `0x${string}`

export default function EggsInfo({ isInMiniApp }: { isInMiniApp: boolean }) {
  const [miniAppAddress, setMiniAppAddress] = useState<`0x${string}` | null>(
    null
  )
  const [isUnstaking, setIsUnstaking] = useState(false)
  const account = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { connectAsync, connectors } = useConnect()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()
  const activeAddress = account.address || miniAppAddress || undefined

  useEffect(() => {
    if (!isInMiniApp) {
      setMiniAppAddress(null)
      return
    }

    let isMounted = true

    getMiniAppWalletAddress()
      .then((address) => {
        if (!isMounted) return
        setMiniAppAddress(address as `0x${string}` | null)
      })
      .catch(() => {
        if (!isMounted) return
        setMiniAppAddress(null)
      })

    return () => {
      isMounted = false
    }
  }, [isInMiniApp])

  const { data: ethBalanceData } = useBalance({
    address: activeAddress,
    chainId: base.id,
  })

  const {
    data: stakedEggs,
    refetch: refetchStakedEggs,
    isLoading: isLoadingStake,
  } = useReadContract({
    address: EGGS_CONTRACT,
    abi: eggsContractAbi,
    functionName: 'stakeOf',
    args: [activeAddress || zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!activeAddress,
      refetchInterval: 1000 * 10,
    },
  })

  const { data: walletEggs, refetch: refetchWalletEggs } = useReadContract({
    address: EGGS_CONTRACT,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [activeAddress || zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!activeAddress,
      refetchInterval: 1000 * 10,
    },
  })

  const refreshContractData = useCallback(async () => {
    await Promise.all([refetchStakedEggs(), refetchWalletEggs()])
  }, [refetchStakedEggs, refetchWalletEggs])

  const ensureReadyForWrite = useCallback(async () => {
    let walletAddress = account.address

    if (!walletAddress && isInMiniApp) {
      const farcasterConnector = connectors.find((connector) =>
        connector.id.includes('farcaster')
      )

      if (farcasterConnector) {
        const result = await connectAsync({
          chainId: base.id,
          connector: farcasterConnector,
        })
        walletAddress = result.accounts[0]
      }
    }

    if (!walletAddress) {
      throw new Error('Connect wallet first')
    }

    const ethBalance =
      ethBalanceData?.value ||
      (await publicClient?.getBalance({
        address: walletAddress,
      }))

    if (!ethBalance || ethBalance <= 0n) {
      throw new Error('You need ETH on Base to pay for gas')
    }

    if (chainId !== base.id) {
      await switchChainAsync({ chainId: base.id })
    }

    return walletAddress
  }, [
    account.address,
    chainId,
    connectAsync,
    connectors,
    ethBalanceData,
    isInMiniApp,
    publicClient,
    switchChainAsync,
  ])

  const waitForReceipt = useCallback(
    async (hash: `0x${string}`) => {
      await publicClient?.waitForTransactionReceipt({
        hash,
        confirmations: 2,
      })
    },
    [publicClient]
  )

  const handleUnstake = useCallback(async () => {
    if (!stakedEggs || stakedEggs <= 0n) {
      toast.error('No staked $EGGS found')
      return
    }

    setIsUnstaking(true)
    try {
      await ensureReadyForWrite()
      await toast.promise(
        (async () => {
          const hash = await writeContractAsync({
            chainId: base.id,
            address: EGGS_CONTRACT,
            abi: eggsContractAbi,
            functionName: 'unstake',
          })

          await waitForReceipt(hash)
          await refreshContractData()
          return hash
        })(),
        {
          loading: 'Unstaking $EGGS...',
          success: 'Unstaked $EGGS',
          error: (error) => `Failed to unstake: ${extractErrorMessage(error)}`,
        }
      )
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      setIsUnstaking(false)
    }
  }, [
    ensureReadyForWrite,
    refreshContractData,
    stakedEggs,
    waitForReceipt,
    writeContractAsync,
  ])

  if (!activeAddress && !isInMiniApp) {
    return (
      <p className="text-19 text-jet-0.6 text-center">
        Connect a wallet to use the shutdown actions.
      </p>
    )
  }

  return (
    <ShutdownActionsView
      address={activeAddress || null}
      isUnstaking={isUnstaking || isLoadingStake}
      onCopyAddress={() => {
        if (!activeAddress) return
        void navigator.clipboard.writeText(activeAddress)
        toast.success('Copied wallet')
      }}
      onUnstake={() => {
        void handleUnstake()
      }}
      stakedEggs={stakedEggs}
      walletEggs={walletEggs}
    />
  )
}
