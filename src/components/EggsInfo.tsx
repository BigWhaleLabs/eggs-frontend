import frameSdk from '@farcaster/frame-sdk'
import { useQuery } from '@tanstack/react-query'
import eggsContractAbi from 'helpers/eggsContractAbi'
import { formatCompactNumber } from 'helpers/formatCompactNumber'
import zalgo from 'helpers/zalgo'
import useConnectFarcaster from 'hooks/useConnectFarcaster'
import { useEggsInfo } from 'hooks/useEggsInfo'
import { ModalState, useModal } from 'hooks/useModal'
import useURQLClient from 'hooks/useURQLClient'
import FilledStar from 'icons/FilledStar'
import InfoSign from 'icons/InfoSign'
import Star from 'icons/Star'
import { useCallback, useState } from 'preact/compat'
import {
  claimEggsMutation,
  getMyData,
  getMyUnclaimedCoupons,
} from 'queries/eggsQueries'
import toast from 'react-hot-toast'
import { useMutation } from 'urql'
import { erc20Abi, formatUnits, zeroAddress } from 'viem'
import { base } from 'viem/chains'
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from 'wagmi'
import { ActionButton } from './Buttons'
import DottedInfo from './DottedInfo'

const eggFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  minimumSignificantDigits: 1,
})

function ClaimStreakStars({
  claimNumber,
  claimedToday,
}: {
  claimNumber: number
  claimedToday: boolean
}) {
  const totalExtraStars = 6
  const preStarNumber = Math.min(
    claimedToday ? claimNumber - 1 : claimNumber,
    totalExtraStars
  )
  const postStarNumber = totalExtraStars - preStarNumber

  return (
    <div className="flex flex-row items-center justify-center gap-1">
      {preStarNumber > 0 &&
        Array(preStarNumber)
          .fill(0)
          .map((_, index) => <FilledStar key={index} />)}
      <div className="flex items-center justify-center rounded-full p-1.5 bg-[#AEE615]">
        {claimedToday ? <FilledStar /> : <Star filled />}
      </div>
      {postStarNumber > 0 &&
        Array(postStarNumber)
          .fill(0)
          .map((_, index) => <Star key={index} />)}
    </div>
  )
}

export default function EggsInfo() {
  const { openModal } = useModal()
  const client = useURQLClient()
  const [isClaimingInProgress, setIsClaimingInProgress] = useState(false)
  const [isBurningInProgress, setIsBurningInProgress] = useState(false)
  const [justClaimedEggs, setJustClaimedEggs] = useState(false)

  const fetchHens = useCallback(
    () => client.query(getMyData, {}).toPromise(),
    [client]
  )
  const fetchUnclaimedCoupons = useCallback(
    () => client.query(getMyUnclaimedCoupons, {}).toPromise(),
    [client]
  )

  const { data: unclaimedCouponsData, refetch: refetchUnclaimedCoupons } =
    useQuery({
      queryKey: ['myUnclaimedCoupons'],
      queryFn: fetchUnclaimedCoupons,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: 1000 * 10,
    })

  const { data, refetch } = useQuery({
    queryKey: ['myData'],
    queryFn: fetchHens,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

  const [, claimEggs] = useMutation(claimEggsMutation)

  const displayYield = !!data?.data?.getMe.hens.length

  const eggsAvailableToClaim =
    (data?.data?.getMe.unclaimedEggs || 0) +
    (unclaimedCouponsData?.data?.getMyUnclaimedCoupons.reduce(
      (acc, coupon) => acc + coupon.amount,
      0
    ) || 0)

  const formattedEggs = eggsAvailableToClaim
    ? eggFormatter.format(eggsAvailableToClaim)
    : '0'

  const eggsInfo = useEggsInfo()

  const account = useAccount()
  const connectFarcaster = useConnectFarcaster()
  const { writeContractAsync } = useWriteContract()

  const { data: eggsBalanceData, refetch: refetchEggBalance } = useReadContract(
    {
      address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [account.address || zeroAddress],
      chainId: base.id,
      query: {
        refetchInterval: 1000 * 10,
        enabled: !!account.address,
      },
    }
  )

  const { data: stakeData, refetch: refetchStakeData } = useReadContract({
    address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
    abi: eggsContractAbi,
    functionName: 'stakeOf',
    args: [account.address || zeroAddress],
    chainId: base.id,
    query: {
      refetchInterval: 1000 * 10,
      enabled: !!account.address,
    },
  })

  const { data: contractEggBalanceData, refetch: refetchContractEggBalance } =
    useReadContract({
      address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: ['0x712f43B21cf3e1B189c27678C0f551c08c01D150'],
      chainId: base.id,
      query: {
        refetchInterval: 1000 * 10,
        enabled: !!account.address,
      },
    })

  const { data: ethBalanceData } = useBalance({
    address: account.address || zeroAddress,
    chainId: base.id,
    query: {
      refetchInterval: 1000 * 10,
      enabled: !!account.address,
    },
  })

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      refetch({}),
      refetchEggBalance(),
      refetchStakeData(),
      refetchUnclaimedCoupons({}),
    ])
  }, [refetch, refetchUnclaimedCoupons, refetchEggBalance, refetchStakeData])

  const dailyStreak = data?.data?.getMe.claimStreak

  const publicClient = usePublicClient()

  const handleClaimEggs = async () => {
    if (!account.address) {
      toast.error('No account found. Connect wallet first.')
      return
    }

    if (!ethBalanceData || ethBalanceData.value <= 0n) {
      toast.error('You need some ETH in your wallet to pay for gas')
      return
    }

    await connectFarcaster()

    setIsClaimingInProgress(true)

    try {
      const result = await claimEggs({
        ethAddress: account.address,
      })

      if (result.error || !result.data?.claimAllEggs) {
        console.error(result.error)
        toast.error(
          `Error claiming eggs: ${result.error?.message || 'Unknown error'}`
        )
        setIsClaimingInProgress(false)
        return
      }

      if (!result.data.claimAllEggs.length) {
        toast.error('No eggs to claim')
        setIsClaimingInProgress(false)
        return
      }

      const totalCoupons = result.data.claimAllEggs.length
      const totalEggs = result.data.claimAllEggs.reduce(
        (acc, claim) => acc + claim.amount,
        0
      )
      let claimedEggs = 0

      for (let i = 0; i < totalCoupons; i++) {
        const claim = result.data.claimAllEggs[i]

        if (!claim.message || !claim.r || !claim.vs) {
          toast.error('Invalid claim coupon')
          continue
        }

        try {
          await toast.promise(
            (async () => {
              const txHash = await writeContractAsync({
                chainId: base.id,
                abi: eggsContractAbi,
                address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
                functionName: 'redeemTicket',
                args: [
                  claim.message as `0x${string}`,
                  claim.r as `0x${string}`,
                  claim.vs as `0x${string}`,
                ],
              })

              await publicClient?.waitForTransactionReceipt({
                hash: txHash,
                confirmations: 2,
              })

              claimedEggs += claim.amount
              return claim.amount
            })(),
            {
              loading: `Claiming coupon ${i + 1}/${totalCoupons}, ${claim.amount} eggs of ${totalEggs} total eggs`,
              success: `Claimed ${claim.amount} eggs successfully`,
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
          console.error(`Transaction error for coupon ${i + 1}:`, txError)
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

      if (claimedEggs > 0) {
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
              You successfully claimed {claimedEggs} $EGGS
            </p>
          </div>,
          {
            position: 'bottom-center',
            duration: 5000,
          }
        )

        setJustClaimedEggs(true)

        setTimeout(async () => {
          setJustClaimedEggs(false)
          await refreshAllData()
        }, 15_000)
      }
    } catch (error) {
      console.error('Unexpected error during claim process:', error)
      toast.error(
        error.reason || error.message || 'An unexpected error occurred'
      )
    } finally {
      setIsClaimingInProgress(false)
    }
  }

  return (
    <div
      className="flex flex-col bg-nuclear-blast p-4 pt-6 rounded-xl"
      style={{
        lineHeight: 'normal',
      }}
    >
      {eggsInfo?.marketCap && (
        <div className="flex flex-row justify-between text-19 text-jet-0.6">
          <p>MCAP: ${formatCompactNumber(eggsInfo?.marketCap)}</p>
          <p>
            {account.address && (
              <span
                className="flex flex-row justify-between text-19 text-jet-0.6"
                onClick={() => {
                  if (!account.address) {
                    return
                  }
                  void navigator.clipboard.writeText(account.address)
                  toast.success('Copied to clipboard')
                }}
              >
                {`${account.address.slice(0, 4)}...${account.address.slice(-4)}`}
              </span>
            )}
          </p>
        </div>
      )}
      {account.address &&
        eggsBalanceData !== undefined &&
        stakeData !== undefined && (
          <DottedInfo
            info="TOTAL $EGGS"
            value={(
              Number(formatUnits(eggsBalanceData, 18)) +
              Number(formatUnits(stakeData, 18))
            ).toFixed(4)}
          />
        )}

      {displayYield && (
        <DottedInfo
          info={
            <div className="relative flex flex-row items-center">
              <p>YIELD</p>
              <span className="text-15">/DAY</span>
              <button
                className="ml-2 cursor-pointer"
                onClick={() => {
                  openModal(ModalState.YieldExplained)
                }}
              >
                <InfoSign />
              </button>
            </div>
          }
          value={
            data?.data?.getMe.totalDailyYield
              ? eggFormatter.format(data.data.getMe.totalDailyYield)
              : 0
          }
        />
      )}
      <div className="h-px w-full bg-matcha-powder-0.5 my-2" />
      <div className="flex flex-row gap-1.5 mb-[9px]">
        {account.address && (
          <ActionButton
            disabled={
              isClaimingInProgress || justClaimedEggs || !eggsAvailableToClaim
            }
            textColor={
              eggsAvailableToClaim && !isClaimingInProgress && !justClaimedEggs
                ? 'text-bright-greek'
                : undefined
            }
            flex
            backgroundColor={'bg-bright-greek-0.5'}
            onClick={handleClaimEggs}
          >
            <p>
              {isClaimingInProgress
                ? 'CLAIMING...'
                : justClaimedEggs
                  ? 'CLAIMED'
                  : 'CLAIM EGGS'}
              {!isClaimingInProgress &&
                !justClaimedEggs &&
                !!eggsAvailableToClaim && <span> ({formattedEggs})</span>}
            </p>
          </ActionButton>
        )}
        {!account.address && (
          <ActionButton
            flex
            backgroundColor={'bg-bright-greek-0.5'}
            onClick={async () => {
              await connectFarcaster()
            }}
          >
            <p>CONNECT WALLET</p>
          </ActionButton>
        )}
        {account.address && (
          <ActionButton
            flex
            backgroundColor="bg-bright-greek"
            onClick={() => {
              return frameSdk.actions.swapToken({
                buyToken:
                  'eip155:8453/erc20:0x712f43B21cf3e1B189c27678C0f551c08c01D150',
              })
            }}
          >
            <p>{zalgo('BUY')}</p>
          </ActionButton>
        )}
      </div>
      {account.address &&
        contractEggBalanceData !== undefined &&
        contractEggBalanceData >= 10n * 10n ** 18n && (
          <div className="mt-2 w-full flex">
            <ActionButton
              disabled={isBurningInProgress}
              flex
              backgroundColor="bg-bright-greek"
              onClick={async () => {
                setIsBurningInProgress(true)
                try {
                  await toast.promise(
                    (async () => {
                      const txHash = await writeContractAsync({
                        abi: eggsContractAbi,
                        address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
                        functionName: 'burnFees',
                        chainId: base.id,
                      })

                      await publicClient?.waitForTransactionReceipt({
                        hash: txHash,
                        confirmations: 2,
                      })
                      await refetchContractEggBalance()
                    })(),
                    {
                      loading: `Burning fees...`,
                      success: `Burned fees successfully`,
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

                        return `Failed to burn fees: ${cause}`
                      },
                    }
                  )
                } catch (txError) {
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
                } finally {
                  setIsBurningInProgress(false)
                }
              }}
            >
              <p className="uppercase">
                {isClaimingInProgress
                  ? 'Burning...'
                  : '🔥 Burn fees for 0.1 $eggs'}
              </p>
            </ActionButton>
          </div>
        )}
      {dailyStreak && (
        <div className="flex flex-row items-center justify-between mt-2">
          <p className="uppercase text-15 text-black mt-1">
            {zalgo('Daily claim streak:')}
          </p>
          <ClaimStreakStars
            claimNumber={dailyStreak.claimNumber}
            claimedToday={dailyStreak.claimedToday}
          />
        </div>
      )}
    </div>
  )
}
