import { useQuery } from '@tanstack/react-query'
import { selectedHenAtom } from 'atoms/eggochiAtom'
import useURQLClient from 'hooks/useURQLClient'
import { useAtomValue } from 'jotai'
import { useCallback } from 'preact/compat'
import { getMyData, getMyOnchainChickens } from 'queries/eggsQueries'
import { EggAnimations } from './EggAnimation'
import Eggochi from './Eggochi'
import EggsInfo from './EggsInfo'
import GameFooter from './GameFooter'
import InviteButton from './InviteButton'
import JackpotHeader from './JackpotHeader'
import MegapotTicketsBackground from './MegapotTicketsBackground'

export default function Game() {
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

  const { data } = useQuery({
    queryKey: ['myData'],
    queryFn: fetchHens,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

  const { data: onchainData } = useQuery({
    queryKey: ['myOnchainChickens'],
    queryFn: fetchOnchainHens,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

  console.log(
    'onchain chickens:',
    onchainData?.data?.getOnchainOwnedHens.length
  )

  // Merge database hens with onchain hens
  const databaseHens = data?.data?.getMe.hens || []
  const onchainHens = onchainData?.data?.getOnchainOwnedHens || []
  const allHens = [...databaseHens, ...onchainHens]
  const selectedHen = allHens[selectedHenIndex - 1]

  return (
    <>
      <div className="pb-1 h-full flex flex-col overflow-y-auto">
        <div className="top-0 left-0 right-0 z-0">
          <MegapotTicketsBackground />
        </div>
        <div className="px-4 pt-3 z-10">
          <div className="flex justify-stretch z-20">
            <JackpotHeader />
          </div>
          <div className="mt-2">
            <EggsInfo />
          </div>
          <div className="relative flex-grow flex flex-col mt-2">
            <div className="relative flex flex-col items-center">
              <div>
                <Eggochi
                  animation={
                    !!selectedHen ? EggAnimations.Chicken : EggAnimations.Egg
                  }
                  withButtons
                />
              </div>
              <div className="w-full -mt-12">
                <GameFooter />
              </div>
            </div>
            <div className="absolute top-0">
              <InviteButton />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
