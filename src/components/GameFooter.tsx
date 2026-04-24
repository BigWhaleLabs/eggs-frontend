import { useQuery } from '@tanstack/react-query'
import { selectedHenAtom } from 'atoms/eggochiAtom'
import { soundEnabledAtom } from 'atoms/tokenAtom'
import useURQLClient from 'hooks/useURQLClient'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'preact/hooks'
import { getMyData, getMyOnchainChickens } from 'queries/eggsQueries'
import FooterChickenInfo from './Footers/ChickenInfo'
import FooterFreeHen from './Footers/FreeHen'
import HatchNextHen from './Footers/HatchNextHen'

export default function GameFooter() {
  const selectedHenIndex = useAtomValue(selectedHenAtom)

  const client = useURQLClient()
  const fetchHens = useCallback(
    () => client.query(getMyData, {}).toPromise(),
    [client]
  )
  const fetchOnchainHens = useCallback(
    () => client.query(getMyOnchainChickens, {}).toPromise(),
    [client]
  )

  const { data, refetch } = useQuery({
    queryKey: ['myData'],
    queryFn: fetchHens,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

  const { data: onchainData, refetch: refetchOnchain } = useQuery({
    queryKey: ['myOnchainChickens'],
    queryFn: fetchOnchainHens,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

  const refetchChickenInfo = useCallback(async () => {
    await refetch()
    await refetchOnchain()
  }, [refetch, refetchOnchain])

  // Merge database hens with onchain hens
  const databaseHens = data?.data?.getMe.hens || []
  const onchainHens = onchainData?.data?.getOnchainOwnedHens || []

  // Create combined array: database hens first, then onchain hens
  const allHens = [...databaseHens, ...onchainHens]

  // For hatching logic, we only count database hens (positions 1-3 can still be hatched)
  const databaseHenCount = databaseHens.length

  const selectedHen = allHens[selectedHenIndex - 1]
  const isSelectedHenOnchainOnly = selectedHenIndex > databaseHenCount

  // Get database owner info for onchain chickens
  const selectedOnchainHen = isSelectedHenOnchainOnly
    ? onchainHens[selectedHenIndex - databaseHenCount - 1]
    : null
  const [soundEnabled, setSoundEnabled] = useAtom(soundEnabledAtom)

  // Only allow hatching for the first triplet (positions 1, 2, 3) and only if that specific position is empty
  // This means if user has chickens in positions 1 and 4, they can still hatch at positions 2 and 3
  const canHatchAtSelectedPosition = selectedHenIndex <= 3 && !selectedHen

  return (
    <>
      <button
        onClick={() => setSoundEnabled((prev) => !prev)}
        className="cursor-pointer bg-nuclear-blast flex justify-center items-center self-end justify-self-end rounded-full p-4 h-12 w-12"
        style={{
          marginBottom: 12,
          boxShadow: '0px 0px 8px 0px #FFB700',
        }}
      >
        <p
          className="text-2xl"
          style={{
            lineHeight: 'normal',
          }}
        >
          {soundEnabled ? '🔈' : '🔇'}
        </p>
      </button>
      <div
        className="w-full bg-nuclear-blast px-4 pb-4"
        style={{
          borderRadius: '80px 80px 12px 12px',
          lineHeight: 'normal',
        }}
      >
        <div className="pt-16 w-full flex flex-col text-center gap-[9px]">
          {!!allHens.length ? (
            <>
              {!!selectedHen ? (
                <FooterChickenInfo
                  serialId={selectedHen.serialId}
                  chickenId={selectedHen?.id}
                  chickenName={selectedHen?.name}
                  chickenLevel={selectedHen?.level}
                  dailyYield={selectedHen?.dailyYield}
                  onchainOwnerAddress={selectedHen?.onchainOwnerAddress || null}
                  refetchChickenInfo={refetchChickenInfo}
                  isOnchainOnly={selectedHenIndex > databaseHenCount}
                  databaseOwnerIsVerifiedBot={
                    selectedOnchainHen?.user?.isVerifiedBot || false
                  }
                  databaseOwnerNeynarScore={
                    selectedOnchainHen?.user?.neynarUserScore || 1.0
                  }
                />
              ) : canHatchAtSelectedPosition ? (
                <HatchNextHen henNumber={selectedHenIndex} />
              ) : (
                // Empty position but can't hatch (either beyond position 3 or onchain-only position)
                <div className="text-center">
                  <p className="text-lg text-jet-0.6">
                    {selectedHenIndex > 3
                      ? 'Navigate back to positions 1-3 to hatch new chickens'
                      : 'This position is reserved'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <FooterFreeHen />
          )}
        </div>
      </div>
    </>
  )
}
