import chickensAbi from 'helpers/chickensAbi'
import eggsContractAbi from 'helpers/eggsContractAbi'
import { getShutdownAuthorizationMessage } from 'helpers/shutdownAuth'
import { useCallback, useEffect, useState } from 'preact/hooks'
import {
  getHenMintSignatureMutation,
  getMyShutdownHensQuery,
} from 'queries/eggsQueries'
import toast from 'react-hot-toast'
import { useClient, useMutation } from 'urql'
import { erc20Abi, formatUnits, parseUnits, zeroAddress } from 'viem'
import { base } from 'viem/chains'
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useReadContract,
  useSignMessage,
  useSwitchChain,
  useWriteContract,
} from 'wagmi'
import ShutdownActionsView, {
  ChickenMintState,
  extractErrorMessage,
  getShutdownChickensErrorMessage,
  ShutdownChicken,
} from './ShutdownActionsView'

const EGGS_CONTRACT =
  '0x712f43B21cf3e1B189c27678C0f551c08c01D150' as `0x${string}`
const CHICKENS_CONTRACT =
  '0x84EEA2bE67b17698B0E09B57eEEdA47aa921BbF0' as `0x${string}`
const CHICKEN_MINT_ALLOWANCE = parseUnits('4000', 18)
const CHICKEN_MINT_PRICE = parseUnits('4000', 18)

export default function EggsInfo() {
  const [chickens, setChickens] = useState<ShutdownChicken[]>([])
  const [chickensError, setChickensError] = useState<string | null>(null)
  const [isLoadingChickens, setIsLoadingChickens] = useState(false)
  const [shutdownAuth, setShutdownAuth] = useState<{
    address: `0x${string}`
    signature: `0x${string}`
  } | null>(null)
  const [mintStates, setMintStates] = useState<
    Record<number, ChickenMintState>
  >({})
  const [isUnstaking, setIsUnstaking] = useState(false)
  const account = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const urqlClient = useClient()
  const { signMessageAsync } = useSignMessage()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()
  const [, getHenMintSignature] = useMutation(getHenMintSignatureMutation)

  const { data: ethBalanceData } = useBalance({
    address: account.address,
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
    args: [account.address || zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!account.address,
      refetchInterval: 1000 * 10,
    },
  })

  const { data: walletEggs, refetch: refetchWalletEggs } = useReadContract({
    address: EGGS_CONTRACT,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account.address || zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!account.address,
      refetchInterval: 1000 * 10,
    },
  })

  const { data: chickenMintAllowance, refetch: refetchChickenMintAllowance } =
    useReadContract({
      address: EGGS_CONTRACT,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [account.address || zeroAddress, CHICKENS_CONTRACT],
      chainId: base.id,
      query: {
        enabled: !!account.address,
        refetchInterval: 1000 * 10,
      },
    })

  const refreshContractData = useCallback(async () => {
    await Promise.all([
      refetchStakedEggs(),
      refetchWalletEggs(),
      refetchChickenMintAllowance(),
    ])
  }, [refetchChickenMintAllowance, refetchStakedEggs, refetchWalletEggs])

  const updateMintState = useCallback(
    (serialId: number, mintState: ChickenMintState) => {
      setMintStates((previous) => ({
        ...previous,
        [serialId]: mintState,
      }))
    },
    []
  )

  const getShutdownAuthSignature = useCallback(async () => {
    if (!account.address) {
      throw new Error('Connect wallet first')
    }

    if (
      shutdownAuth &&
      shutdownAuth.address.toLowerCase() === account.address.toLowerCase()
    ) {
      return shutdownAuth.signature
    }

    const signature = await signMessageAsync({
      message: getShutdownAuthorizationMessage(account.address),
    })

    setShutdownAuth({
      address: account.address,
      signature,
    })

    return signature
  }, [account.address, shutdownAuth, signMessageAsync])

  const loadShutdownChickens = useCallback(async () => {
    if (!account.address) {
      setChickens([])
      setChickensError(null)
      return
    }

    setIsLoadingChickens(true)
    setChickensError(null)

    try {
      const authSignature = await getShutdownAuthSignature()
      const result = await urqlClient
        .query(
          getMyShutdownHensQuery,
          { authSignature, ownerAddress: account.address },
          { requestPolicy: 'network-only' }
        )
        .toPromise()

      if (result.error) {
        throw result.error
      }

      const shutdownChickens =
        result.data?.getMyShutdownHens.map((chicken) => ({
          id: chicken.id,
          level: chicken.level,
          name: chicken.name,
          onchainOwnerAddress: chicken.onchainOwnerAddress,
          serialId: chicken.serialId,
        })) || []

      setChickens(shutdownChickens)
    } catch (error) {
      setChickensError(getShutdownChickensErrorMessage(error))
      setChickens([])
    } finally {
      setIsLoadingChickens(false)
    }
  }, [account.address, getShutdownAuthSignature, urqlClient])

  useEffect(() => {
    setMintStates({})
    void loadShutdownChickens()
  }, [loadShutdownChickens])

  useEffect(() => {
    setShutdownAuth(null)
  }, [account.address])

  const ensureReadyForWrite = useCallback(async () => {
    if (!account.address) {
      throw new Error('Connect wallet first')
    }

    if (!ethBalanceData || ethBalanceData.value <= 0n) {
      throw new Error('You need ETH on Base to pay for gas')
    }

    if (chainId !== base.id) {
      await switchChainAsync({ chainId: base.id })
    }
  }, [account.address, chainId, ethBalanceData, switchChainAsync])

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

  const handleMintChicken = useCallback(
    async (serialId: number) => {
      if (!Number.isInteger(serialId) || serialId <= 0) {
        toast.error('Invalid chicken serial ID')
        return
      }

      if (!account.address) {
        toast.error('Connect wallet first')
        return
      }
      const walletAddress = account.address

      try {
        updateMintState(serialId, {
          message: 'Checking wallet...',
          phase: 'minting',
        })
        await ensureReadyForWrite()

        if (walletEggs === undefined || walletEggs < CHICKEN_MINT_PRICE) {
          throw new Error(
            `Minting needs at least ${formatUnits(CHICKEN_MINT_PRICE, 18)} $EGGS`
          )
        }

        if (
          chickenMintAllowance === undefined ||
          chickenMintAllowance < CHICKEN_MINT_ALLOWANCE
        ) {
          updateMintState(serialId, {
            message: 'Setting allowance...',
            phase: 'approving',
          })
          await toast.promise(
            (async () => {
              const hash = await writeContractAsync({
                chainId: base.id,
                address: EGGS_CONTRACT,
                abi: erc20Abi,
                functionName: 'approve',
                args: [CHICKENS_CONTRACT, CHICKEN_MINT_ALLOWANCE],
              })

              await waitForReceipt(hash)
              await refetchChickenMintAllowance()
              return hash
            })(),
            {
              loading: 'Setting mint allowance...',
              success: 'Mint allowance set',
              error: (error) =>
                `Failed to set allowance: ${extractErrorMessage(error)}`,
            }
          )
        }

        updateMintState(serialId, {
          message: 'Waiting for signature...',
          phase: 'minting',
        })
        await toast.promise(
          (async () => {
            const authSignature = await getShutdownAuthSignature()
            const signatureResult = await getHenMintSignature({
              authSignature,
              henSerialId: serialId,
              toAddress: walletAddress,
            })

            if (
              signatureResult.error ||
              !signatureResult.data?.getHenMintSignature
            ) {
              throw new Error(
                signatureResult.error?.message || 'Failed to get mint signature'
              )
            }

            const signature = signatureResult.data.getHenMintSignature
            const hash = await writeContractAsync({
              chainId: base.id,
              address: CHICKENS_CONTRACT,
              abi: chickensAbi,
              functionName: 'mintChicken',
              args: [
                signature.message as `0x${string}`,
                signature.r as `0x${string}`,
                signature.vs as `0x${string}`,
              ],
            })

            await waitForReceipt(hash)
            await refreshContractData()
            await loadShutdownChickens()
            return hash
          })(),
          {
            loading: `Turning chicken #${serialId} into an NFT...`,
            success: `Chicken #${serialId} minted`,
            error: (error) =>
              `Failed to mint NFT: ${extractErrorMessage(error)}`,
          }
        )
        updateMintState(serialId, {
          message: 'Minted to wallet',
          phase: 'success',
        })
      } catch (error) {
        updateMintState(serialId, {
          message: extractErrorMessage(error),
          phase: 'error',
        })
        toast.error(extractErrorMessage(error))
      }
    },
    [
      account.address,
      chickenMintAllowance,
      ensureReadyForWrite,
      getHenMintSignature,
      getShutdownAuthSignature,
      loadShutdownChickens,
      refetchChickenMintAllowance,
      refreshContractData,
      updateMintState,
      waitForReceipt,
      walletEggs,
      writeContractAsync,
    ]
  )

  if (!account.address) {
    return (
      <p className="text-19 text-jet-0.6 text-center">
        Connect a wallet to use the shutdown actions.
      </p>
    )
  }

  return (
    <ShutdownActionsView
      address={account.address}
      chickens={chickens}
      chickensError={chickensError}
      hasChickenMintAllowance={
        chickenMintAllowance !== undefined &&
        chickenMintAllowance >= CHICKEN_MINT_ALLOWANCE
      }
      hasChickenMintBalance={
        walletEggs !== undefined && walletEggs >= CHICKEN_MINT_PRICE
      }
      isLoadingChickens={isLoadingChickens}
      mintStates={mintStates}
      isUnstaking={isUnstaking || isLoadingStake}
      onCopyAddress={() => {
        if (!account.address) return
        void navigator.clipboard.writeText(account.address)
        toast.success('Copied wallet')
      }}
      onMintChicken={(serialId) => {
        void handleMintChicken(serialId)
      }}
      onUnstake={() => {
        void handleUnstake()
      }}
      stakedEggs={stakedEggs}
      walletEggs={walletEggs}
    />
  )
}
