import { ActionButton } from 'components/Buttons'
import DottedInfo from 'components/DottedInfo'
import chickensAbi from 'helpers/chickensAbi'
import zalgo from 'helpers/zalgo'
import useConnectFarcaster from 'hooks/useConnectFarcaster'
import { ModalState, useModal } from 'hooks/useModal'
import useShare from 'hooks/useShare'
import { useCallback, useState } from 'preact/hooks'
import {
  claimChickenOwnershipMutation,
  getHenMintSignatureMutation,
} from 'queries/eggsQueries'
import toast from 'react-hot-toast'
import { useMutation } from 'urql'
import { erc20Abi, parseUnits } from 'viem'
import { base } from 'viem/chains'
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from 'wagmi'

export const levelToChickenInfo = [
  { price: 0, successRate: 100, dailyYield: 1 },
  {
    price: 1000,
    successRate: 90,
    dailyYield: 10,
  },
  { price: 2500, successRate: 60, dailyYield: 25 },
  { price: 10000, successRate: 30, dailyYield: 75 },
  { price: 30000, successRate: 10, dailyYield: 250 },
  { price: 100000, successRate: 0, dailyYield: 1000 },
] as const

export default function FooterChickenInfo({
  chickenId,
  chickenName,
  chickenLevel,
  dailyYield,
  serialId,
  onchainOwnerAddress,
  refetchChickenInfo,
  isOnchainOnly = false,
  databaseOwnerIsVerifiedBot = false,
  databaseOwnerNeynarScore = 1.0,
}: {
  chickenId: string
  chickenName: string
  chickenLevel: number
  dailyYield: number
  serialId: number
  onchainOwnerAddress: string | null
  refetchChickenInfo?: () => void
  isOnchainOnly?: boolean
  databaseOwnerIsVerifiedBot?: boolean
  databaseOwnerNeynarScore?: number
}) {
  const { shareHen } = useShare()
  const { openModal } = useModal()
  const [counter, setCounter] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [isBurning, setIsBurning] = useState(false)
  const chainId = useChainId()
  const connectFarcaster = useConnectFarcaster()
  const { switchChainAsync } = useSwitchChain()
  const account = useAccount()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  // GraphQL mutation for getting mint signature
  const [, getHenMintSignature] = useMutation(getHenMintSignatureMutation)

  // GraphQL mutation for claiming chicken ownership
  const [, claimChickenOwnership] = useMutation(claimChickenOwnershipMutation)

  // Contract addresses
  const EGGS_CONTRACT =
    '0x712f43B21cf3e1B189c27678C0f551c08c01D150' as `0x${string}`
  const CHICKENS_CONTRACT =
    '0x84EEA2bE67b17698B0E09B57eEEdA47aa921BbF0' as `0x${string}`
  const REQUIRED_ALLOWANCE = parseUnits('4000', 18) // 4000 $EGGS with 18 decimals

  // Get ETH balance for gas check
  const { data: ethBalanceData } = useBalance({
    address: account.address,
    chainId: base.id,
  })

  // Use the onchainOwnerAddress field to determine if NFT is minted
  const isChickenMinted = !!onchainOwnerAddress

  // Check if chicken should show "Release" button
  // Only for onchain-only chickens where database owner is a verified bot or has low Neynar score
  const shouldShowReleaseButton =
    isOnchainOnly &&
    (databaseOwnerIsVerifiedBot || databaseOwnerNeynarScore < 0.69)

  // Check current allowance
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract(
    {
      address: EGGS_CONTRACT,
      abi: erc20Abi,
      functionName: 'allowance',
      args: account.address
        ? [account.address, CHICKENS_CONTRACT]
        : [CHICKENS_CONTRACT, CHICKENS_CONTRACT], // fallback to avoid errors
      chainId: base.id,
      query: {
        enabled: !!account.address,
      },
    }
  )

  const hasEnoughAllowance = currentAllowance
    ? currentAllowance >= REQUIRED_ALLOWANCE
    : false

  // Helper function to extract error messages
  const extractErrorMessage = useCallback((error: unknown): string => {
    if (!error) return 'Unknown error occurred'
    const err = error as Record<string, unknown>
    return (
      (typeof err['message'] === 'string' ? err['message'] : null) ||
      ((err['cause'] as Record<string, unknown>)?.['shortMessage'] as string) ||
      ((err['case'] as Record<string, unknown>)?.['detail'] as string) ||
      ((err['case'] as Record<string, unknown>)?.['message'] as string) ||
      ((err['data'] as Record<string, unknown>)?.['message'] as string) ||
      ((err['case'] as Record<string, unknown>)?.['error'] as string) ||
      (err['message'] as string) ||
      (err['reason'] as string) ||
      'Transaction failed'
    )
  }, [])

  const handleMintChicken = useCallback(async () => {
    if (!account.address) {
      toast.error('No account found. Connect wallet first.')
      return
    }

    if (!ethBalanceData || ethBalanceData.value <= 0n) {
      toast.error('You need some ETH in your wallet to pay for gas')
      return
    }

    await connectFarcaster()

    setIsProcessing(true)

    try {
      // Ensure we're on Base chain
      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id })
      }

      // Check and set allowance if needed
      if (!hasEnoughAllowance) {
        await toast.promise(
          (async () => {
            const txHash = await writeContractAsync({
              chainId: base.id,
              address: EGGS_CONTRACT,
              abi: erc20Abi,
              functionName: 'approve',
              args: [CHICKENS_CONTRACT, REQUIRED_ALLOWANCE],
            })

            await publicClient?.waitForTransactionReceipt({
              hash: txHash,
              confirmations: 2,
            })

            await refetchAllowance()
            return txHash
          })(),
          {
            loading: 'Setting allowance for $EGGS...',
            success: 'Allowance set successfully!',
            error: (txError: unknown) => {
              const cause = extractErrorMessage(txError)
              return `Failed to set allowance: ${cause}`
            },
          }
        )
      }

      // Get mint signature from GraphQL and mint the chicken
      await toast.promise(
        (async () => {
          const signatureResult = await getHenMintSignature({
            henSerialId: serialId,
            toAddress: account.address as string,
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

          if (!signature.message || !signature.r || !signature.vs) {
            throw new Error('Invalid mint signature')
          }

          const txHash = await writeContractAsync({
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

          await publicClient?.waitForTransactionReceipt({
            hash: txHash,
            confirmations: 2,
          })

          // Refresh chicken data to get updated onchainOwnerAddress
          if (refetchChickenInfo) {
            await refetchChickenInfo()
          }

          return txHash
        })(),
        {
          loading: `Turning ${chickenName} into an NFT...`,
          success: `${chickenName} successfully turned into an NFT!`,
          error: (txError: unknown) => {
            const cause = extractErrorMessage(txError)
            return `Failed to mint NFT: ${cause}`
          },
        }
      )
    } finally {
      setIsProcessing(false)
    }
  }, [
    account.address,
    ethBalanceData,
    connectFarcaster,
    chainId,
    switchChainAsync,
    hasEnoughAllowance,
    writeContractAsync,
    publicClient,
    refetchAllowance,
    getHenMintSignature,
    serialId,
    chickenName,
    EGGS_CONTRACT,
    CHICKENS_CONTRACT,
    REQUIRED_ALLOWANCE,
    refetchChickenInfo,
    extractErrorMessage,
  ])

  const handleTransferToCoop = useCallback(async () => {
    if (!account.address) {
      toast.error('No account found. Connect wallet first.')
      return
    }

    setIsTransferring(true)

    try {
      await toast.promise(
        (async () => {
          const result = await claimChickenOwnership({
            henSerialId: serialId,
          })

          if (result.error) {
            throw new Error(
              result.error.message || 'Failed to transfer chicken to coop'
            )
          }

          // Refresh chicken data after successful transfer
          if (refetchChickenInfo) {
            await refetchChickenInfo()
          }

          return result.data?.claimChickenOwnership
        })(),
        {
          loading: `Transferring ${chickenName} to your coop...`,
          success: `${chickenName} successfully transferred to your coop!`,
          error: (transferError: unknown) => {
            const cause = extractErrorMessage(transferError)
            return `Failed to transfer chicken: ${cause}`
          },
        }
      )
    } finally {
      setIsTransferring(false)
    }
  }, [
    account.address,
    chickenName,
    refetchChickenInfo,
    extractErrorMessage,
    claimChickenOwnership,
    serialId,
  ])

  const handleReleaseChicken = useCallback(async () => {
    if (!account.address) {
      toast.error('No account found. Connect wallet first.')
      return
    }

    if (!ethBalanceData || ethBalanceData.value <= 0n) {
      toast.error('You need some ETH in your wallet to pay for gas')
      return
    }

    setIsBurning(true)

    try {
      // Ensure we're on Base chain
      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id })
      }

      // Burn the NFT token
      await toast.promise(
        (async () => {
          const txHash = await writeContractAsync({
            chainId: base.id,
            address: CHICKENS_CONTRACT,
            abi: chickensAbi,
            functionName: 'burn',
            args: [BigInt(serialId)],
          })

          await publicClient?.waitForTransactionReceipt({
            hash: txHash,
            confirmations: 2,
          })

          // Refresh chicken data after successful burn
          if (refetchChickenInfo) {
            await refetchChickenInfo()
          }

          return txHash
        })(),
        {
          loading: `Releasing ${chickenName} to the wild...`,
          success: `${chickenName} has been released! The NFT has been burned.`,
          error: (burnError: unknown) => {
            const cause = extractErrorMessage(burnError)
            return `Failed to release chicken: ${cause}`
          },
        }
      )
    } finally {
      setIsBurning(false)
    }
  }, [
    account.address,
    ethBalanceData,
    chainId,
    switchChainAsync,
    writeContractAsync,
    publicClient,
    CHICKENS_CONTRACT,
    chickenName,
    serialId,
    refetchChickenInfo,
    extractErrorMessage,
  ])

  // Format owner address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex flex-row justify-between items-center">
          <p className="uppercase text-44">{zalgo(chickenName)}</p>
          <ActionButton
            onClick={async () => {
              setCounter(counter + 1)
              await shareHen(chickenId)
            }}
            borderColor={'border-prickly-pink'}
            backgroundColor="bg-bright-greek-0.1"
          >
            <p className="text-prickly-pink">SHARE</p>
          </ActionButton>
        </div>
        <div className="flex flex-row justify-between items-center">
          <p
            className="text-2xl text-bright-greek"
            style={{
              lineHeight: 'normal',
            }}
          >
            lvl {chickenLevel}
          </p>
          {isChickenMinted && (
            <p className="text-sm text-matcha-powder pt-1">
              Owner:{' '}
              {onchainOwnerAddress
                ? formatAddress(onchainOwnerAddress)
                : 'Unknown'}
            </p>
          )}
        </div>
      </div>
      <div className="h-px w-full bg-matcha-powder-0.5" />
      <DottedInfo
        info={
          <>
            $EGGS YIELD<span className="text-15">/DAY</span>
          </>
        }
        value={dailyYield}
      />
      <div className="flex flex-col gap-2">
        {/* NFT Button - Show different states based on mint status */}
        {!isChickenMinted && (
          <ActionButton
            backgroundColor="bg-prickly-pink"
            flex
            onClick={handleMintChicken}
            disabled={isProcessing}
          >
            <p className="text-white">
              {isProcessing ? 'PROCESSING...' : 'TURN INTO AN NFT'}
            </p>
          </ActionButton>
        )}

        {/* Transfer to coop button - only show for onchain-only chickens */}
        {isOnchainOnly && (
          <ActionButton
            backgroundColor="bg-bright-greek"
            flex
            onClick={handleTransferToCoop}
            disabled={isTransferring}
          >
            <p className="text-white">
              {isTransferring ? 'TRANSFERRING...' : 'TRANSFER TO MY COOP'}
            </p>
          </ActionButton>
        )}

        {/* Release chicken button - only show for onchain-only chickens with bot/low score database owners */}
        {shouldShowReleaseButton && (
          <>
            <ActionButton
              backgroundColor="bg-red-500"
              flex
              onClick={handleReleaseChicken}
              disabled={isBurning}
            >
              <p className="text-white">
                {isBurning ? 'RELEASING...' : 'RELEASE THE CHICKEN'}
              </p>
            </ActionButton>
            <p className="text-sm text-center text-matcha-powder px-2">
              Releasing this chicken will give you 25 $eggs for your humanity.
              Released chickens cannot be turned into NFTs again. It will
              disappear from your account forever.
            </p>
          </>
        )}

        {/* Level up buttons - only show for database chickens, not onchain-only */}
        {!isOnchainOnly && (
          <>
            <ActionButton
              backgroundColor="bg-bright-greek"
              flex
              disabled={chickenLevel > 4}
              onClick={async () => {
                await connectFarcaster()

                if (chainId !== base.id) {
                  await switchChainAsync({ chainId: base.id })
                }

                openModal(ModalState.LevelUpHen, {
                  chickenSerialId: serialId,
                  level: chickenLevel - 1,
                  chickenName,
                })
              }}
            >
              {chickenLevel > 4
                ? `MAX`
                : `LEVEL UP FOR ${levelToChickenInfo[chickenLevel].price.toString()} $EGGS`}
            </ActionButton>
            <ActionButton
              backgroundColor="bg-moot-green"
              flex
              onClick={() => {
                openModal(ModalState.Staking)
              }}
            >
              <p className="text-white">STAKE $EGGS</p>
            </ActionButton>
            <button
              className="cursor-pointer pt-3"
              onClick={() => {
                openModal(ModalState.WhyLevelUp)
              }}
            >
              <p
                className="text-lg text-bright-greek"
                style={{
                  lineHeight: 'normal',
                }}
              >
                {zalgo('Why level up?')}
              </p>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
