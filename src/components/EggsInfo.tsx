import chickensAbi from 'helpers/chickensAbi'
import eggsContractAbi from 'helpers/eggsContractAbi'
import { useCallback, useState } from 'preact/hooks'
import { getHenMintSignatureMutation } from 'queries/eggsQueries'
import toast from 'react-hot-toast'
import { useMutation } from 'urql'
import { erc20Abi, parseUnits, zeroAddress } from 'viem'
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
import ShutdownActionsView, {
  extractErrorMessage,
  parseChickenSerialId,
} from './ShutdownActionsView'

const EGGS_CONTRACT =
  '0x712f43B21cf3e1B189c27678C0f551c08c01D150' as `0x${string}`
const CHICKENS_CONTRACT =
  '0x84EEA2bE67b17698B0E09B57eEEdA47aa921BbF0' as `0x${string}`
const CHICKEN_MINT_ALLOWANCE = parseUnits('4000', 18)

export default function EggsInfo() {
  const [chickenSerialId, setChickenSerialId] = useState('')
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isMintingChicken, setIsMintingChicken] = useState(false)
  const account = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
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

  const handleMintChicken = useCallback(async () => {
    const serialId = parseChickenSerialId(chickenSerialId)
    if (!serialId) {
      toast.error('Enter a valid chicken serial ID')
      return
    }

    if (!account.address) {
      toast.error('Connect wallet first')
      return
    }
    const walletAddress = account.address

    setIsMintingChicken(true)
    try {
      await ensureReadyForWrite()

      if (
        chickenMintAllowance === undefined ||
        chickenMintAllowance < CHICKEN_MINT_ALLOWANCE
      ) {
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

      await toast.promise(
        (async () => {
          const signatureResult = await getHenMintSignature({
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
          setChickenSerialId('')
          return hash
        })(),
        {
          loading: `Turning chicken #${serialId} into an NFT...`,
          success: `Chicken #${serialId} minted`,
          error: (error) => `Failed to mint NFT: ${extractErrorMessage(error)}`,
        }
      )
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      setIsMintingChicken(false)
    }
  }, [
    account.address,
    chickenMintAllowance,
    chickenSerialId,
    ensureReadyForWrite,
    getHenMintSignature,
    refetchChickenMintAllowance,
    refreshContractData,
    waitForReceipt,
    writeContractAsync,
  ])

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
      chickenSerialId={chickenSerialId}
      hasChickenMintAllowance={
        chickenMintAllowance !== undefined &&
        chickenMintAllowance >= CHICKEN_MINT_ALLOWANCE
      }
      isMintingChicken={isMintingChicken}
      isUnstaking={isUnstaking || isLoadingStake}
      onChickenSerialIdChange={setChickenSerialId}
      onCopyAddress={() => {
        if (!account.address) return
        void navigator.clipboard.writeText(account.address)
        toast.success('Copied wallet')
      }}
      onMintChicken={() => {
        void handleMintChicken()
      }}
      onUnstake={() => {
        void handleUnstake()
      }}
      stakedEggs={stakedEggs}
      walletEggs={walletEggs}
    />
  )
}
