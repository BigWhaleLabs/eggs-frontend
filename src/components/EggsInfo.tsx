import chickensAbi from 'helpers/chickensAbi'
import eggsContractAbi from 'helpers/eggsContractAbi'
import {
  getMiniAppQuickAuthFetchOptions,
  getMiniAppWalletAddress,
} from 'helpers/farcasterMiniApp'
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
  useConnect,
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

function getSignatureErrorMessage(error: unknown) {
  const message = extractErrorMessage(error)
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes('rejected') ||
    normalizedMessage.includes('denied') ||
    normalizedMessage.includes('4001')
  ) {
    return 'Authorization rejected. Press See My Hens to try again.'
  }

  return message
}

export default function EggsInfo({ isInMiniApp }: { isInMiniApp: boolean }) {
  const [chickens, setChickens] = useState<ShutdownChicken[]>([])
  const [chickensError, setChickensError] = useState<string | null>(null)
  const [hasRequestedChickens, setHasRequestedChickens] = useState(false)
  const [isSigningChickens, setIsSigningChickens] = useState(false)
  const [isLoadingChickens, setIsLoadingChickens] = useState(false)
  const [shutdownAuth, setShutdownAuth] = useState<{
    address: `0x${string}`
    signature: `0x${string}`
  } | null>(null)
  const [miniAppAddress, setMiniAppAddress] = useState<`0x${string}` | null>(
    null
  )
  const [mintStates, setMintStates] = useState<
    Record<number, ChickenMintState>
  >({})
  const [isUnstaking, setIsUnstaking] = useState(false)
  const account = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const urqlClient = useClient()
  const { connectAsync, connectors } = useConnect()
  const { signMessageAsync } = useSignMessage()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()
  const [, getHenMintSignature] = useMutation(getHenMintSignatureMutation)
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

  const { data: chickenMintAllowance, refetch: refetchChickenMintAllowance } =
    useReadContract({
      address: EGGS_CONTRACT,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [activeAddress || zeroAddress, CHICKENS_CONTRACT],
      chainId: base.id,
      query: {
        enabled: !!activeAddress,
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
    if (isInMiniApp) return null

    if (!activeAddress) {
      throw new Error('Connect wallet first')
    }

    if (
      shutdownAuth &&
      shutdownAuth.address.toLowerCase() === activeAddress.toLowerCase()
    ) {
      return shutdownAuth.signature
    }

    const message = getShutdownAuthorizationMessage(activeAddress)
    const signature = await signMessageAsync({
      message,
    })

    setShutdownAuth({
      address: activeAddress,
      signature,
    })

    return signature
  }, [activeAddress, isInMiniApp, shutdownAuth, signMessageAsync])

  const loadShutdownChickens = useCallback(async () => {
    if (!activeAddress && !isInMiniApp) {
      setChickens([])
      setChickensError(null)
      setHasRequestedChickens(false)
      return
    }

    setHasRequestedChickens(true)
    setChickensError(null)

    let authSignature: `0x${string}` | null
    let requestContext:
      | Awaited<ReturnType<typeof getMiniAppQuickAuthFetchOptions>>
      | undefined
    try {
      setIsSigningChickens(true)
      ;[authSignature, requestContext] = await Promise.all([
        getShutdownAuthSignature(),
        getMiniAppQuickAuthFetchOptions(isInMiniApp),
      ])
    } catch (error) {
      setChickensError(getSignatureErrorMessage(error))
      setChickens([])
      return
    } finally {
      setIsSigningChickens(false)
    }

    setIsLoadingChickens(true)

    try {
      const result = await urqlClient
        .query(
          getMyShutdownHensQuery,
          { authSignature, ownerAddress: activeAddress || null },
          {
            ...requestContext,
            requestPolicy: 'network-only',
          }
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
  }, [activeAddress, getShutdownAuthSignature, isInMiniApp, urqlClient])

  useEffect(() => {
    setChickens([])
    setChickensError(null)
    setHasRequestedChickens(false)
    setIsSigningChickens(false)
    setIsLoadingChickens(false)
    setShutdownAuth(null)
    setMintStates({})
  }, [activeAddress])

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

  const handleMintChicken = useCallback(
    async (serialId: number) => {
      if (!Number.isInteger(serialId) || serialId <= 0) {
        toast.error('Invalid chicken serial ID')
        return
      }

      if (!activeAddress && !isInMiniApp) {
        toast.error('Connect wallet first')
        return
      }

      try {
        updateMintState(serialId, {
          message: 'Checking wallet...',
          phase: 'minting',
        })
        const walletAddress = await ensureReadyForWrite()

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
            const [authSignature, requestContext] = await Promise.all([
              getShutdownAuthSignature(),
              getMiniAppQuickAuthFetchOptions(isInMiniApp),
            ])
            const signatureResult = await getHenMintSignature(
              {
                authSignature,
                henSerialId: serialId,
                toAddress: walletAddress,
              },
              requestContext
            )

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
      activeAddress,
      chickenMintAllowance,
      ensureReadyForWrite,
      getHenMintSignature,
      getShutdownAuthSignature,
      isInMiniApp,
      loadShutdownChickens,
      refetchChickenMintAllowance,
      refreshContractData,
      updateMintState,
      waitForReceipt,
      walletEggs,
      writeContractAsync,
    ]
  )

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
      chickens={chickens}
      chickensError={chickensError}
      hasChickenMintAllowance={
        chickenMintAllowance !== undefined &&
        chickenMintAllowance >= CHICKEN_MINT_ALLOWANCE
      }
      hasChickenMintBalance={
        walletEggs !== undefined && walletEggs >= CHICKEN_MINT_PRICE
      }
      hasRequestedChickens={hasRequestedChickens}
      isSigningChickens={isSigningChickens}
      isLoadingChickens={isLoadingChickens}
      mintStates={mintStates}
      isUnstaking={isUnstaking || isLoadingStake}
      onCopyAddress={() => {
        if (!activeAddress) return
        void navigator.clipboard.writeText(activeAddress)
        toast.success('Copied wallet')
      }}
      onMintChicken={(serialId) => {
        void handleMintChicken(serialId)
      }}
      onLoadChickens={() => {
        void loadShutdownChickens()
      }}
      onUnstake={() => {
        void handleUnstake()
      }}
      stakedEggs={stakedEggs}
      walletEggs={walletEggs}
    />
  )
}
