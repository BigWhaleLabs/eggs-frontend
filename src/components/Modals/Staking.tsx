import { useQuery } from '@tanstack/react-query'
import { ActionButton } from 'components/Buttons'
import eggsContractAbi from 'helpers/eggsContractAbi'
import { useModal } from 'hooks/useModal'
import useURQLClient from 'hooks/useURQLClient'
import { useCallback, useState } from 'preact/hooks'
import { getMyData } from 'queries/eggsQueries'
import toast from 'react-hot-toast'
import { formatUnits, parseUnits } from 'viem'
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

export default function Staking() {
  const { closeModal } = useModal()
  const [stakeAmount, setStakeAmount] = useState('')
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [showConfirmUnstake, setShowConfirmUnstake] = useState(false)

  const client = useURQLClient()
  const account = useAccount()
  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const EGGS_CONTRACT =
    '0x712f43B21cf3e1B189c27678C0f551c08c01D150' as `0x${string}`

  const fetchUserData = useCallback(
    () => client.query(getMyData, {}).toPromise(),
    [client]
  )

  const { isFetched } = useQuery({
    queryKey: ['myData'],
    queryFn: fetchUserData,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

  // Get user's $EGGS balance
  const { data: eggsBalance, refetch: refetchBalance } = useBalance({
    address: account.address,
    token: EGGS_CONTRACT,
    chainId: base.id,
    query: {
      enabled: !!account.address,
    },
  })

  // Get user's current stake
  const { data: currentStake, refetch: refetchStake } = useReadContract({
    address: EGGS_CONTRACT,
    abi: eggsContractAbi,
    functionName: 'stakeOf',
    args: account.address ? [account.address] : ['0x0'],
    chainId: base.id,
    query: {
      enabled: !!account.address,
    },
  })

  // Check if staking is open
  const { data: stakingOpen } = useReadContract({
    address: EGGS_CONTRACT,
    abi: eggsContractAbi,
    functionName: 'stakingOpen',
    chainId: base.id,
  })

  const showLoading = !isFetched
  const hasStake = currentStake && currentStake > 0n
  const eggsBalanceFormatted = eggsBalance
    ? Number(formatUnits(eggsBalance.value, 18))
    : 0
  const currentStakeFormatted = currentStake
    ? Number(formatUnits(currentStake, 18))
    : 0

  const handleMaxClick = () => {
    setStakeAmount(Math.floor(eggsBalanceFormatted).toString())
  }

  const handleStake = useCallback(async () => {
    if (!account.address) {
      toast.error('No account found. Connect wallet first.')
      return
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid stake amount.')
      return
    }

    if (!stakingOpen) {
      toast.error('Come back Tuesday 2pm LA time!')
      return
    }

    setIsStaking(true)

    try {
      // Ensure we're on Base chain
      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id })
      }

      const stakeAmountWei = parseUnits(stakeAmount, 18)

      await toast.promise(
        (async () => {
          const txHash = await writeContractAsync({
            chainId: base.id,
            address: EGGS_CONTRACT,
            abi: eggsContractAbi,
            functionName: 'stake',
            args: [stakeAmountWei],
          })

          await publicClient?.waitForTransactionReceipt({
            hash: txHash,
            confirmations: 2,
          })

          // Refresh balances
          await Promise.all([refetchBalance(), refetchStake()])
          setStakeAmount('')

          return txHash
        })(),
        {
          loading: 'Staking $EGGS...',
          success: `Successfully staked ${stakeAmount} $EGGS!`,
          error: (error: unknown) => {
            const err = error as Record<string, unknown>
            const cause = err?.['cause'] as Record<string, unknown>
            const shortMessage = cause?.['shortMessage'] as string
            return `Failed to stake: ${shortMessage || 'Transaction failed'}`
          },
        }
      )
    } finally {
      setIsStaking(false)
    }
  }, [
    account.address,
    stakeAmount,
    stakingOpen,
    chainId,
    switchChainAsync,
    writeContractAsync,
    publicClient,
    refetchBalance,
    refetchStake,
    EGGS_CONTRACT,
  ])

  const handleUnstake = useCallback(async () => {
    if (!account.address) {
      toast.error('No account found. Connect wallet first.')
      return
    }

    setIsUnstaking(true)

    try {
      // Ensure we're on Base chain
      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id })
      }

      await toast.promise(
        (async () => {
          const txHash = await writeContractAsync({
            chainId: base.id,
            address: EGGS_CONTRACT,
            abi: eggsContractAbi,
            functionName: 'unstake',
            args: [],
          })

          await publicClient?.waitForTransactionReceipt({
            hash: txHash,
            confirmations: 2,
          })

          // Refresh balances
          await Promise.all([refetchBalance(), refetchStake()])
          setShowConfirmUnstake(false)

          return txHash
        })(),
        {
          loading: 'Unstaking $EGGS...',
          success: `Successfully unstaked ${currentStakeFormatted.toLocaleString()} $EGGS!`,
          error: (error: unknown) => {
            const err = error as Record<string, unknown>
            const cause = err?.['cause'] as Record<string, unknown>
            const shortMessage = cause?.['shortMessage'] as string
            return `Failed to unstake: ${shortMessage || 'Transaction failed'}`
          },
        }
      )
    } finally {
      setIsUnstaking(false)
    }
  }, [
    account.address,
    chainId,
    switchChainAsync,
    writeContractAsync,
    publicClient,
    refetchBalance,
    refetchStake,
    currentStakeFormatted,
    EGGS_CONTRACT,
  ])

  if (showConfirmUnstake) {
    return (
      <div
        className="bg-nuclear-blast p-4 pt-6 flex flex-col gap-[9px] text-center rounded-xl"
        style={{
          lineHeight: 'normal',
        }}
      >
        <p className="text-49 text-bright-greek">Confirm Unstake</p>
        <p className="text-19 text-jet-0.6">
          Are you sure you want to unstake all{' '}
          {currentStakeFormatted.toLocaleString()} $EGGS?
        </p>
        <p className="text-19 text-jet-0.6">
          Unstaking will disqualify you from weekly rewards and you can only
          unstake all eggs at once.
        </p>
        <div className="w-full h-px bg-matcha-powder-0.5" />
        <ActionButton
          backgroundColor="bg-red-500"
          textColor="text-white"
          onClick={handleUnstake}
          disabled={isUnstaking}
        >
          {isUnstaking ? 'UNSTAKING...' : 'YES, UNSTAKE ALL'}
        </ActionButton>
        <ActionButton
          backgroundColor="bg-bright-greek"
          textColor="text-nuclear-blast"
          onClick={() => setShowConfirmUnstake(false)}
        >
          CANCEL
        </ActionButton>
      </div>
    )
  }

  return (
    <div
      className="bg-nuclear-blast p-4 pt-6 flex flex-col gap-[9px] text-center rounded-xl"
      style={{
        lineHeight: 'normal',
      }}
    >
      <p
        className="text-2xl text-bright-greek uppercase"
        style={{
          lineHeight: 'normal',
        }}
      >
        STAKING $EGGS
      </p>
      <p className="text-19 text-jet-0.6">
        Users that stake $EGGS get 12.5% of weekly burned $EGGS distributed
        proportionally to their stake.
      </p>
      <p className="text-19 text-jet-0.6">
        Staking is only available for 12 hours a week starting 2pm Tuesday Los
        Angeles time.
      </p>
      <div className="h-px w-full bg-matcha-powder-0.5" />

      {/* Current Stake */}
      <div className="flex flex-row justify-between text-19 text-bright-greek">
        <p>Your current stake</p>
        <p>
          {showLoading
            ? 'Loading...'
            : `${currentStakeFormatted.toLocaleString()} $EGGS`}
        </p>
      </div>

      {/* Balance */}
      <div className="flex flex-row justify-between text-black text-19">
        <p>Your $EGGS balance</p>
        <p>
          {showLoading
            ? 'Loading...'
            : `${eggsBalanceFormatted.toLocaleString()} $EGGS`}
        </p>
      </div>

      <div className="w-full h-px bg-matcha-powder-0.5" />

      {/* Staking Interface */}
      {eggsBalanceFormatted > 0 && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-19 text-bright-greek text-left">Stake Amount:</p>
            <div className="flex flex-row gap-2">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) =>
                  setStakeAmount((e.target as HTMLInputElement).value)
                }
                placeholder="Enter amount to stake"
                className="flex-1 p-2 rounded border border-matcha-powder-0.5 text-black"
                min="0"
                max={eggsBalanceFormatted}
                step="0.000001"
              />
              <ActionButton
                backgroundColor="bg-matcha-powder-0.5"
                textColor="text-black"
                onClick={handleMaxClick}
              >
                MAX
              </ActionButton>
            </div>
          </div>

          <ActionButton
            backgroundColor="bg-moot-green"
            textColor="text-white"
            onClick={handleStake}
            disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
          >
            {isStaking ? 'STAKING...' : 'STAKE $EGGS'}
          </ActionButton>
        </>
      )}

      {/* Unstake Button */}
      {!!hasStake && (
        <>
          <div className="w-full h-px bg-matcha-powder-0.5" />
          <ActionButton
            backgroundColor="bg-red-500"
            textColor="text-white"
            onClick={() => setShowConfirmUnstake(true)}
          >
            UNSTAKE ALL
          </ActionButton>
          <p className="text-15 text-jet-0.6">
            You can only unstake all eggs at once. Unstaking disqualifies you
            from weekly rewards.
          </p>
        </>
      )}

      <div className="w-full h-px bg-matcha-powder-0.5" />
      <ActionButton
        backgroundColor="bg-bright-greek"
        textColor="text-nuclear-blast"
        onClick={closeModal}
      >
        CLOSE
      </ActionButton>
    </div>
  )
}
