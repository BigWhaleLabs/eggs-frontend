import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ActionButton } from 'components/Buttons'
import DottedInfo from 'components/DottedInfo'
import JackpotHeader from 'components/JackpotHeader'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import weekday from 'dayjs/plugin/weekday'
import eggsContractAbi from 'helpers/eggsContractAbi'
import useConnectFarcaster from 'hooks/useConnectFarcaster'
import useEggsHoldings from 'hooks/useEggsHoldings'
import { ModalState, useModal } from 'hooks/useModal'
import useURQLClient from 'hooks/useURQLClient'
import Arrow from 'icons/Arrow'
import InfoSign from 'icons/InfoSign'
import { useCallback, useMemo, useState } from 'preact/compat'
import {
  claimJackpotTicketsMutation,
  getMyData,
  getUnclaimedJackpotsCoupon,
} from 'queries/eggsQueries'
import toast from 'react-hot-toast'
import { useMutation } from 'urql'
import { formatUnits, zeroAddress } from 'viem'
import { base } from 'viem/chains'
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from 'wagmi'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(weekday)

export const Route = createFileRoute('/jackpot')({
  component: RouteComponent,
})

const rules = [
  {
    emoji: '🥚',
    title: 'Hold 1,000+ $EGGS',
    description: '1 ticket per 1,000 eggs.',
  },
  {
    emoji: '📈',
    title: 'Upgrade Hens',
    description: '30 tickets per attempt (fail or succeed).',
  },
  {
    emoji: '⏰',
    title: 'Claim eggs daily',
    description: '2 tickets for a 7-day eggs claim streak.',
  },
  {
    emoji: '🍆',
    title: 'Refer new players',
    description: '2 tickets per referral.',
  },
]

function Box({ snapshot = false }: { snapshot?: boolean }) {
  return (
    <div
      className="flex flex-col p-3 rounded-xl flex-1 items-center text-center"
      style={{
        border: '1px solid rgba(0, 0, 0, 0.10)',
      }}
    >
      <p
        className="text-2xl"
        style={{
          lineHeight: 'normal',
        }}
      >
        {snapshot ? '📸' : '🤑'}
      </p>
      <p
        className="text-xl text-black"
        style={{
          lineHeight: 'normal',
        }}
      >
        {snapshot ? 'Monday' : 'Tuesday'}
      </p>
      <p
        className="text-base text-jet-0.6"
        style={{
          lineHeight: 'normal',
        }}
      >
        2 PM LA time
      </p>
      <p
        className="text-base text-jet-0.6"
        style={{
          lineHeight: 'normal',
        }}
      >
        {snapshot ? 'Snapshot/tickets' : 'Draw'}
      </p>
    </div>
  )
}

const tiers = [
  { winnerCount: 1, percentage: 25 },
  { winnerCount: 2, percentage: 20 },
  { winnerCount: 3, percentage: 18 },
  { winnerCount: 5, percentage: 15 },
  { winnerCount: 10, percentage: 12 },
  { winnerCount: 10, percentage: 10 },
]

function RouteComponent() {
  const client = useURQLClient()
  const [isClaimingInProgress, setIsClaimingInProgress] = useState(false)
  const [justClaimed, setJustClaimed] = useState(false)
  const account = useAccount()
  const { writeContractAsync } = useWriteContract()

  const { isClaimDay, nextClaimDate } = useMemo(() => {
    const now = dayjs().tz('America/Los_Angeles')
    const currentDay = now.day()
    const currentHour = now.hour()

    const isClaimDay =
      (currentDay === 1 && currentHour >= 14) ||
      (currentDay === 2 && currentHour < 14)

    let nextClaim = now.day(1).hour(14).minute(0).second(0)

    if ((currentDay === 1 && currentHour >= 14) || currentDay > 1) {
      nextClaim = nextClaim.add(7, 'day')
    }

    return {
      isClaimDay,
      nextClaimDate: nextClaim,
    }
  }, [])

  const fetchUnclaimedJackpotCoupon = useCallback(
    () => client.query(getUnclaimedJackpotsCoupon, {}).toPromise(),
    [client]
  )

  const fetchHens = useCallback(
    () => client.query(getMyData, {}).toPromise(),
    [client]
  )
  const {
    data,
    isLoading,
    refetch: refetchMyData,
  } = useQuery({
    queryKey: ['myData'],
    queryFn: fetchHens,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

  const { data: unclaimedCouponData, refetch: refetchUnclaimedCoupon } =
    useQuery({
      queryKey: ['unclaimedJackpotCoupon'],
      queryFn: fetchUnclaimedJackpotCoupon,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: 1000 * 10,
    })

  const [ticketsEarnedExpanded, setTicketsEarnedExpanded] = useState(false)

  const claimStreakBonus = data?.data?.getMe.shouldDisplayJackpotPreviewData
    ? (data?.data?.getMe.claimStreak.claimNumber || 0) >= 7
      ? 2
      : 0
    : 0

  const { isLoading: isLoadingBalances, eggBalances } = useEggsHoldings()

  const holdingsBonus = data?.data?.getMe.shouldDisplayJackpotPreviewData
    ? isLoadingBalances
      ? 0
      : eggBalances.reduce((acc, { eggsBalance }) => {
          if (eggsBalance) {
            const balance = Number(formatUnits(eggsBalance, 18)) / 1000
            return acc + Math.floor(balance)
          }
          return acc
        }, 0)
    : 0

  const { openModal } = useModal()

  const [, claimJackpotTicket] = useMutation(claimJackpotTicketsMutation)

  const connectFarcaster = useConnectFarcaster()

  const { data: ethBalanceData } = useBalance({
    address: account.address || zeroAddress,
    chainId: base.id,
    query: {
      refetchInterval: 1000 * 10,
      enabled: !!account.address,
    },
  })

  const refreshAllData = useCallback(async () => {
    await refetchMyData({})
    await refetchUnclaimedCoupon({})
  }, [refetchMyData, refetchUnclaimedCoupon])

  const isAlreadyClaimed = !!data?.data?.getMe.didClaimCurrentJackpot

  const formattedNextClaimDate = nextClaimDate.format('MMMM D')

  const { data: currentJackpotIndex } = useReadContract({
    address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
    abi: eggsContractAbi,
    functionName: 'currentJackpotId',
    args: [],
    chainId: base.id,
    query: {
      refetchInterval: 1000 * 10,
    },
  })

  const { data: jackpotLastIndex } = useReadContract({
    address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
    abi: eggsContractAbi,
    functionName: 'jackpotLastTicketIndexes',
    args: [currentJackpotIndex || 13n],
    chainId: base.id,
  })

  const publicClient = usePublicClient()

  return (
    <>
      <div className="pb-1 h-full flex flex-col overflow-y-auto">
        <div className="px-4 pt-3 pb-1 h-full flex flex-col z-10 gap-2">
          <div className="flex justify-stretch z-20">
            <JackpotHeader direction="backward" />
          </div>
          <div className="px-4 py-3 rounded-xl bg-nuclear-blast flex flex-col gap-3">
            <div
              className="flex flex-row gap-3 items-center justify-stretch cursor-pointer"
              onClick={() => {
                if (
                  !!data?.data?.getMe.getJackpotTickets.length ||
                  claimStreakBonus ||
                  holdingsBonus
                ) {
                  setTicketsEarnedExpanded(!ticketsEarnedExpanded)
                }
              }}
            >
              <DottedInfo
                info={
                  (data?.data?.getMe?.totalJackpotTicketsClaimed || 0) > 0
                    ? 'Total tickets claimed'
                    : 'Tickets earned'
                }
                value={
                  (data?.data?.getMe?.totalJackpotTicketsClaimed || 0) > 0
                    ? jackpotLastIndex !== undefined
                      ? Number(jackpotLastIndex)
                      : 'loading...'
                    : isLoading
                      ? 'loading...'
                      : (data?.data?.getMe.getJackpotTicketsCount || 0) +
                          claimStreakBonus +
                          holdingsBonus ||
                        unclaimedCouponData?.data?.unclaimedJackpotCoupons?.reduce(
                          (acc, coupon) => acc + coupon.amount,
                          0
                        ) ||
                        0
                }
              />
              {(!!data?.data?.getMe.getJackpotTickets.length ||
                !!claimStreakBonus ||
                !!holdingsBonus) && (
                <Arrow smol direction={ticketsEarnedExpanded ? 'up' : 'down'} />
              )}
            </div>
            {ticketsEarnedExpanded && (
              <div className="flex flex-col">
                {data?.data?.getMe.getJackpotTickets.map(({ type, amount }) => (
                  <div
                    className="flex flex-row justify-between items-center text-19 text-black"
                    key={type}
                  >
                    <p className="opacity-50">{type}</p>
                    <p className="text-bright-greek">{amount}</p>
                  </div>
                ))}
                <div className="flex flex-row justify-between items-center text-19 text-black">
                  <p className="opacity-50">DAILY CLAIMS</p>
                  <p className="text-bright-greek">{claimStreakBonus}</p>
                </div>
                <div className="flex flex-row justify-between items-center text-19 text-black">
                  <div className="flex flex-row items-center ">
                    <p className="opacity-50">HOLDINGS</p>
                    <button
                      className="ml-1 cursor-pointer -mt-[6px]"
                      onClick={() => {
                        openModal(ModalState.Wallets)
                      }}
                    >
                      <InfoSign />
                    </button>
                  </div>
                  <p className="text-bright-greek">{holdingsBonus}</p>
                </div>
              </div>
            )}
            <p className="text-jackpot-secondary-text font-medium text-16">
              Each ticket is a chance to win the jackpot.
            </p>
            <ActionButton
              disabled={
                isClaimingInProgress ||
                justClaimed ||
                isAlreadyClaimed ||
                ((data?.data?.getMe.getJackpotTicketsCount || 0) <= 0 &&
                  !unclaimedCouponData?.data?.unclaimedJackpotCoupons?.length)
              }
              textColor={
                !isAlreadyClaimed && !isClaimingInProgress && !justClaimed
                  ? 'text-bright-greek'
                  : undefined
              }
              flex
              backgroundColor={'bg-bright-greek-0.5'}
              onClick={async () => {
                if (!isClaimDay && !isAlreadyClaimed && !justClaimed) {
                  toast.error(
                    `Ticket claims are closed. Come back on ${formattedNextClaimDate}, at 14:00 LA time!`
                  )
                  return
                }
                await connectFarcaster()

                if (!ethBalanceData || ethBalanceData.value <= 0n) {
                  toast.error('You need some ETH in your wallet to pay for gas')
                  return
                }

                if (!account.address) {
                  toast.error('Please connect your wallet first')
                  return
                }

                setIsClaimingInProgress(true)

                try {
                  const result = await claimJackpotTicket({
                    ethAddress: account.address,
                  })

                  if (result.error || !result.data?.claimJackpotTickets) {
                    console.error(result.error)
                    toast.error(
                      `Error claiming jackpot tickets: ${result.error?.message || 'Unknown error'}`
                    )
                    setIsClaimingInProgress(false)
                    return
                  }

                  const coupons = result.data.claimJackpotTickets
                  if (!coupons.length) {
                    toast.error('No jackpot tickets to claim')
                    setIsClaimingInProgress(false)
                    return
                  }

                  const totalCoupons = coupons.length
                  const totalTickets = coupons.reduce(
                    (acc, coupon) => acc + coupon.amount,
                    0
                  )
                  let claimedTickets = 0

                  for (let i = 0; i < coupons.length; i++) {
                    const coupon = coupons[i]

                    if (!coupon.message || !coupon.r || !coupon.vs) {
                      toast.error('Invalid jackpot ticket coupon')
                      continue
                    }

                    try {
                      await toast.promise(
                        (async () => {
                          const txHash = await writeContractAsync({
                            abi: eggsContractAbi,
                            chainId: base.id,
                            address:
                              '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
                            functionName: 'redeemJackpotTicket',
                            args: [
                              coupon.message as `0x${string}`,
                              coupon.r as `0x${string}`,
                              coupon.vs as `0x${string}`,
                            ],
                          })

                          await publicClient?.waitForTransactionReceipt({
                            hash: txHash,
                            confirmations: 2,
                          })

                          claimedTickets += coupon.amount
                          return coupon.amount
                        })(),
                        {
                          loading: `Claiming coupon ${i + 1}/${totalCoupons}, ${coupon.amount} ticket${coupon.amount > 1 ? 's' : ''} of ${totalTickets} total`,
                          success: `Claimed ${coupon.amount} ticket${coupon.amount > 1 ? 's' : ''} successfully`,
                          error: (txError) => {
                            const cause =
                              txError?.cause?.shortMessage ||
                              txError?.case?.detail ||
                              txError?.case?.message ||
                              txError?.data?.message ||
                              txError?.case?.error ||
                              txError?.message ||
                              txError?.reason ||
                              'Unknown error'

                            return `Failed to claim coupon ${i + 1}/${totalCoupons}: ${cause}`
                          },
                        }
                      )
                    } catch (txError) {
                      console.error(
                        `Transaction error for coupon ${i + 1}:`,
                        txError
                      )
                      const cause =
                        txError?.cause?.shortMessage ||
                        txError?.case?.detail ||
                        txError?.case?.message ||
                        txError?.data?.message ||
                        txError?.case?.error ||
                        txError?.message ||
                        txError?.reason ||
                        'Unknown error'

                      toast.error(`Error during transaction: ${cause}`)
                    }
                  }

                  if (claimedTickets > 0) {
                    await refreshAllData()

                    toast.custom(
                      <div
                        className="rounded-md uppercase text-2xl p-3"
                        style={{
                          background: '#F12696',
                          boxShadow: '0px 0px 14px 0px #F12696',
                        }}
                      >
                        <p
                          className="text-white"
                          style={{
                            lineHeight: 'normal',
                          }}
                        >
                          You successfully claimed {claimedTickets} jackpot
                          entry ticket{claimedTickets > 1 ? 's' : ''}
                        </p>
                      </div>,
                      {
                        position: 'bottom-center',
                        duration: 5000,
                      }
                    )

                    setJustClaimed(true)

                    setTimeout(async () => {
                      setJustClaimed(false)
                      await refreshAllData()
                    }, 15_000)
                  }
                } catch (error) {
                  console.error(
                    'Unexpected error during jackpot claim process:',
                    error
                  )
                  toast.error(
                    error.reason ||
                      error.message ||
                      'An unexpected error occurred during claiming jackpot entry'
                  )
                } finally {
                  setIsClaimingInProgress(false)
                }
              }}
            >
              <p>
                {isClaimingInProgress
                  ? 'CLAIMING...'
                  : justClaimed || isAlreadyClaimed
                    ? `CLAIMED ${data?.data?.getMe.totalJackpotTicketsClaimed} TICKETS!`
                    : 'CLAIM TICKETS'}
              </p>
            </ActionButton>
            <div className="w-full h-px bg-jackpot-separator" />
            <div className="flex flex-col gap-2">
              <p className="text-bright-greek text-2xl">How to earn tickets</p>
              <div className="flex flex-col gap-3">
                {rules.map((rule) => (
                  <div key={rule.emoji} className="flex flex-row gap-1">
                    <p className="text-19 text-jet">{rule.emoji}</p>
                    <div className="flex flex-col">
                      <p className="text-19 text-jet font-medium -mb-1">
                        {rule.title}
                      </p>
                      <p className="text-16 text-jackpot-secondary-text">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-bright-greek text-2xl">When?</p>
              <div className="flex flex-row gap-[9px] items-center">
                <Box snapshot />
                <p>👉</p>
                <Box />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-bright-greek text-2xl">Who wins?</p>
              <p className="text-jackpot-secondary-text text-19">
                30 winners weekly:
              </p>
              <div className="flex flex-col">
                <div className="flex flex-row justify-between text-bright-greek text-19">
                  <p className="flex-[1]">Tier</p>
                  <p className="flex-[1] text-center"># winners</p>
                  <p className="flex-[1] text-right">% jackpot</p>
                </div>
                {tiers.map((tier, index) => (
                  <div className="flex flex-row justify-between text-black text-19">
                    <p className="flex-[1]">{index + 1}</p>
                    <p className="flex-[1] text-center">{tier.winnerCount}</p>
                    <p className="flex-[1] text-right">{tier.percentage}%</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full h-px bg-jackpot-separator" />
            <div className="flex flex-col">
              <p className="text-bright-greek text-19">Stipulations</p>
              <div className="flex flex-col text-jackpot-secondary-text">
                <p>{'Min neynar score >=0.69 or lvl 3 chicken'}</p>
                <p>Tickets refresh / expire weekly</p>
                <p>Winners skip the next week</p>
                <p>Must claim your tickets after the snapshot</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
