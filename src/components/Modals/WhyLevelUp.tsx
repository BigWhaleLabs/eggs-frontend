import { useQuery } from '@tanstack/react-query'
import { ActionButton } from 'components/Buttons'
import { levelToChickenInfo } from 'components/Footers/ChickenInfo'
import useConnectFarcaster from 'hooks/useConnectFarcaster'
import { ModalState, useModal } from 'hooks/useModal'
import useURQLClient from 'hooks/useURQLClient'
import useYieldWithFactor from 'hooks/useYieldFactor'
import { atom } from 'jotai'
import { useCallback } from 'preact/hooks'
import { getMyData } from 'queries/eggsQueries'
import { base } from 'viem/chains'
import { useChainId, useSwitchChain } from 'wagmi'

export const upgradeStatusAtom = atom<boolean>(false)

export default function WhyLevelUp() {
  const { closeModal, openModal } = useModal()

  const client = useURQLClient()
  const fetchHens = useCallback(
    () => client.query(getMyData, {}).toPromise(),
    [client]
  )

  const chainId = useChainId()

  const connectFarcaster = useConnectFarcaster()
  const { switchChainAsync } = useSwitchChain()
  const { calculateYield } = useYieldWithFactor()

  const { data } = useQuery({
    queryKey: ['myData'],
    queryFn: fetchHens,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

  return (
    <div className="flex flex-col items-center gap-6 relative max-h-screen">
      <div
        className="bg-nuclear-blast p-4 pt-6 flex flex-col gap-[9px] text-center rounded-xl w-full overflow-y-auto max-h-[80vh]"
        style={{
          lineHeight: 'normal',
        }}
      >
        <p className="text-49 text-bright-greek">B-Bok bak!</p>
        <p
          className="text-2xl text-bright-greek uppercase"
          style={{
            lineHeight: 'normal',
          }}
        >
          Level up your hens
        </p>
        <div className="h-px w-full bg-matcha-powder-0.5" />

        <div className="flex flex-row text-19 text-bright-greek gap-[20%] items-center w-full">
          <p className="w-1/12 text-center">lvl</p>
          <p className="w-1/12 text-center">Price</p>
          <p className="w-1/12  items-center flex flex-col text-center">
            Success <br />
            rate
          </p>
          <p className="w-1/12 text-center">
            Yield
            <br />
            /day
          </p>
        </div>

        <div className="h-px w-full bg-matcha-powder-0.5" />

        <div className="w-full flex flex-col justify-self-center">
          {levelToChickenInfo.map((level, index) => {
            return index > 4 ? null : (
              <div className="flex flex-col" key={index}>
                <div
                  className="flex flex-row gap-[20%] w-full py-1 text-black items-center"
                  style={{
                    fontSize: 20,
                  }}
                >
                  <p className="w-1/12 text-center">{index + 1}</p>
                  <div className="w-1/12 flex flex-col items-center text-center">
                    <p className="text-center">{level.price}</p>
                    <p
                      className="text text-base text-jet-0.6"
                      style={{
                        lineHeight: 'normal',
                      }}
                    >
                      $EGGS
                    </p>
                  </div>
                  <p className="w-1/12 text-center">{level.successRate}%</p>
                  <div className="w-1/12 flex flex-col items-center text-center">
                    <p className="text-center">
                      {calculateYield(level.dailyYield)}
                    </p>
                    <p
                      className="text text-base text-jet-0.6"
                      style={{
                        lineHeight: 'normal',
                      }}
                    >
                      $EGGS
                    </p>
                  </div>
                </div>
                <div className="h-px w-full bg-matcha-powder-0.5 my-[9px]" />
              </div>
            )
          })}
        </div>
        <div className="flex flex-row flex-wrap justify-between gap-[9px]">
          {data?.data?.getMe.hens.map((hen, index) => {
            return (
              <div
                className="flex flex-col items-center text-center justify-center gap-[9px]"
                key={index}
              >
                <p
                  className="text-2xl"
                  style={{
                    lineHeight: 'normal',
                  }}
                >
                  🐔
                </p>
                <div>
                  <p
                    className="text-black"
                    style={{
                      fontSize: 20,
                    }}
                  >
                    {hen.name}
                  </p>
                  <p
                    className="text-base text-jet-0.6"
                    style={{
                      lineHeight: 'normal',
                    }}
                  >
                    lvl {hen.level}
                  </p>
                </div>
                <ActionButton
                  backgroundColor="bg-bright-greek"
                  disabled={hen.level > 4}
                  onClick={async () => {
                    await connectFarcaster()

                    if (chainId !== base.id) {
                      await switchChainAsync({ chainId: base.id })
                    }
                    openModal(ModalState.LevelUpHen, {
                      chickenSerialId: hen.serialId,
                      level: hen.level - 1,
                      chickenName: hen.name,
                    })
                  }}
                >
                  {hen.level > 4 ? 'MAX' : 'LVL UP'}
                </ActionButton>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-1 mt-2 sticky bottom-0">
        <ActionButton
          borderColor="border-white"
          textColor="text-white"
          onClick={closeModal}
        >
          CLOSE
        </ActionButton>
      </div>
    </div>
  )
}
