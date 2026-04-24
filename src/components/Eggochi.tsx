import { useQuery } from '@tanstack/react-query'
import { selectedHenAtom } from 'atoms/eggochiAtom'
import zalgo from 'helpers/zalgo'
import { ModalState, useModal } from 'hooks/useModal'
import useURQLClient from 'hooks/useURQLClient'
import Arrow from 'icons/Arrow'
import BronzeSquare from 'icons/BronzeSquare'
import ChickenFarm from 'icons/ChickenFarm'
import EggPrice from 'icons/EggPrice'
import egg from 'images/egg.webp'
import pigeon from 'images/pigeon.webp'
import { useAtom } from 'jotai'
import { useCallback } from 'preact/hooks'
import { getMyData, getMyOnchainChickens } from 'queries/eggsQueries'
import EggAnimation, { EggAnimations } from './EggAnimation'
import EggochiButton from './EggochiButton'

export default function Eggochi({
  animation = EggAnimations.Egg,
  withButtons = false,
  displayEggPrices = false,
}: {
  animation?: EggAnimations
  displayEggPrices?: boolean
  withButtons?: boolean
}) {
  const client = useURQLClient()
  const { openModal } = useModal()
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

  const [selectedHen, setSelectedHen] = useAtom(selectedHenAtom)
  const avatar = data?.data?.getMe.avatar

  // Merge database hens with onchain hens
  const databaseHens = data?.data?.getMe.hens || []
  const onchainHens = onchainData?.data?.getOnchainOwnedHens || []
  const allHens = [...databaseHens, ...onchainHens]
  const totalHens = allHens.length

  // Get tips data
  const tipsLeftForLikes = data?.data?.getMe.tipsLeftForLikes || 0
  const tipsLeftForComments = data?.data?.getMe.tipsLeftForComments || 0
  const tipsLeftForFollows = data?.data?.getMe.tipsLeftForFollows || 0

  // Calculate which triplet we're currently viewing based on selectedHen
  const currentTripletStart = Math.floor((selectedHen - 1) / 3) * 3 + 1
  const totalTriplets = Math.ceil(totalHens / 3)
  const currentTripletIndex = Math.floor((selectedHen - 1) / 3)

  const navigateLeft = () => {
    if (currentTripletIndex === 0) {
      // Go to last page
      const lastTripletStart = (totalTriplets - 1) * 3 + 1
      setSelectedHen(lastTripletStart)
    } else {
      setSelectedHen(currentTripletStart - 3)
    }
  }

  const navigateRight = () => {
    if (currentTripletIndex === totalTriplets - 1) {
      // Go to first page
      setSelectedHen(1)
    } else {
      setSelectedHen(currentTripletStart + 3)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      {displayEggPrices && (
        <div className="-mb-30 ml-8 pointer-events-none">
          <EggPrice />
        </div>
      )}
      <div className="relative">
        <img src={egg} alt="egg" className="w-[284px] h-[357px]" />

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg flex items-center justify-center mt-1">
          <div className="z-10">
            <EggAnimation key={animation} animation={animation} />
          </div>
          <div className="absolute">
            <BronzeSquare />
          </div>
        </div>

        {withButtons && (
          <div className="absolute top-0 left-0 right-0 bottom-0 z-10 pointer-events-none">
            <div
              className="w-12 h-12 mx-auto mt-3 rounded-full"
              style={{
                background: `url(${avatar}) lightgray 50% / cover no-repeat`,
                boxShadow: '0px 4px 4px 0px #000 inset',
              }}
            />
          </div>
        )}

        {tipsLeftForLikes !== undefined && (
          <button
            onClick={() => openModal(ModalState.TipInfo)}
            className="absolute top-0 -right-8 flex flex-col items-center justify-center bg-nuclear-blast rounded-full p-3 w-fit h-fit min-w-[80px] min-h-[80px] cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              boxShadow: '0px 0px 8px 0px #FFB700',
              aspectRatio: '1 / 1',
            }}
          >
            <div className="flex flex-row items-center gap-[2px] -mb-2">
              <p className="uppercase text-[24px] text-jet font-medium">tip</p>
              <div className="mb-[3px]">
                <Arrow direction="right" smol color="#333534" />
              </div>
            </div>
            <p className="uppercase text-[24px] text-bright-greek leading-none font-medium">
              {(
                tipsLeftForLikes +
                tipsLeftForComments +
                tipsLeftForFollows
              ).toLocaleString()}
            </p>
            <p className="uppercase text-[14px] color-[#3335344D] font-medium -mt-1">
              {zalgo('$eggs')}
            </p>
          </button>
        )}

        {data?.data?.getMe && (
          <button
            onClick={() => openModal(ModalState.ProxyManagement)}
            className="absolute bottom-0 -left-8 flex flex-col items-center justify-center bg-nuclear-blast rounded-full w-[50px] aspect-square cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              boxShadow: '0px 0px 8px 0px #FFB700',
              aspectRatio: '1 / 1',
            }}
          >
            <img
              src={pigeon}
              alt="proxy"
              className="w-full h-full object-contain rounded-full overflow-hidden"
            />
          </button>
        )}
        {withButtons && (
          <>
            <div className="absolute top-52 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              {/* Navigation arrows - show both when there are more than 3 hens */}
              {totalHens > 3 && (
                <>
                  <button
                    onClick={navigateLeft}
                    className="absolute right-32 z-10 cursor-pointer bg-nuclear-blast rounded-full pr-4 pl-3 py-3 flex items-center justify-center"
                    style={{
                      boxShadow: '0px 0px 8px 0px #FFB700',
                    }}
                  >
                    <Arrow direction="left" />
                  </button>
                  <button
                    onClick={navigateRight}
                    className="absolute left-32 z-10 cursor-pointer bg-nuclear-blast rounded-full pr-3 pl-4 py-3 flex items-center justify-center"
                    style={{
                      boxShadow: '0px 0px 8px 0px #FFB700',
                    }}
                  >
                    <Arrow direction="right" />
                  </button>
                </>
              )}
            </div>
            <div className="absolute bottom-17 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              {/* Hen buttons for current triplet - show all positions in first triplet, only existing hens for other triplets */}
              <div className="absolute z-10 -left-18.5 mb-0.25 ">
                {(currentTripletStart === 1 ||
                  currentTripletStart <= totalHens) && (
                  <EggochiButton
                    henNumber={currentTripletStart}
                    actualHenNumber={currentTripletStart}
                  />
                )}
              </div>
              <div className="absolute z-10 -mb-2.5">
                {(currentTripletStart + 1 <= 3 ||
                  currentTripletStart + 1 <= totalHens) && (
                  <EggochiButton
                    henNumber={currentTripletStart + 1}
                    actualHenNumber={currentTripletStart + 1}
                  />
                )}
              </div>
              <div className="absolute z-10 -right-18.25 mb-0.25">
                {(currentTripletStart + 2 <= 3 ||
                  currentTripletStart + 2 <= totalHens) && (
                  <EggochiButton
                    henNumber={currentTripletStart + 2}
                    actualHenNumber={currentTripletStart + 2}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="absolute mb-59 flex flex-col items-center gap-1">
        <ChickenFarm />
        <p
          style={{
            lineHeight: 'normal',
            background: 'linear-gradient(180deg, #FF8E43 0%, #E32F08 100%)',
            backgroundClip: 'text',
            WebKitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: 42,
            mixBlendMode: 'multiply',
            color: '#FF8E43',
            fontFamily: 'Macintosh128K',
            fontWeight: '500',
            wordWrap: 'break-word',
            textShadow: '0px 4px 4px rgba(0, 0, 0, 0.45) inset',
          }}
        >
          $EGGS
        </p>
      </div>
    </div>
  )
}
