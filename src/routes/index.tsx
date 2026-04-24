import frameSdk from '@farcaster/frame-sdk'
import { usePrivy } from '@privy-io/react-auth'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { onboardingAtom } from 'atoms/tokenAtom'
import { PrimaryButton } from 'components/Buttons'
import Eggochi from 'components/Eggochi'
import NewsTicker from 'components/EggsTicker'
import useEggsBurned from 'hooks/useEggsBurned'
import useLogin from 'hooks/useLogin'
import useShare from 'hooks/useShare'
import TimerWave from 'icons/TimerWave'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'preact/hooks'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/')({
  component: ResponsiveImageContainer,
})

function ResponsiveImageContainer() {
  // Needed to login into frame
  useLogin()
  const navigate = useNavigate()
  const { shareEggsApp } = useShare()
  const { authenticated, ready } = usePrivy()

  const [onboarding] = useAtom(onboardingAtom)

  const [frameAdded, setFrameAdded] = useState(true)
  const [isFrame, setIsFrame] = useState(false)
  useEffect(() => {
    async function checkIfFrameIsAdded() {
      const frameContext = await frameSdk.context
      console.log('frameContext', frameContext)
      const isFrameAdded =
        frameContext.client.added || frameContext.client.clientFid !== 9152
      setFrameAdded(isFrameAdded)
      setIsFrame(!!frameContext.user.fid)
      if (
        (isFrameAdded || !!import.meta.env['VITE_BYPASS_FRAME_ADD']) &&
        ready &&
        authenticated
      ) {
        if (!onboarding) {
          await navigate({
            to: '/onboarding',
          })
        } else {
          await navigate({
            to: '/game',
          })
        }
      }
    }
    void checkIfFrameIsAdded()
  }, [authenticated, navigate, onboarding, ready])

  const burnedData = useEggsBurned()

  return (
    <div>
      <div className="absolute w-full z-10">
        <TimerWave />
        <div
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col"
          style={{
            lineHeight: 'normal',
          }}
        >
          <p
            className="-mb-1"
            style={{
              fontSize: 22,
              color: '#333534',
            }}
          >
            LAY SOME FUN
          </p>
          {!!burnedData && (
            <p
              className="text-2xl md:text-4xl"
              style={{
                color: '#2A3FFF',
              }}
            >
              $EGGS burned:{' '}
              {Math.floor(burnedData)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
            </p>
          )}
        </div>
      </div>
      <div className="h-screen w-full flex items-center justify-center px-12 flex-col">
        <div className="relative flex flex-col items-center justify-center w-full z-10 md:scale-[90%]">
          <Eggochi displayEggPrices />
          <div
            className="flex flex-col mt-4 flex-1 w-full md:max-w-72"
            style={{
              gap: 10,
            }}
          >
            {!frameAdded && (
              <PrimaryButton
                onClick={async () => {
                  try {
                    const frameContext = await frameSdk.context
                    if (frameContext.user.fid) {
                      if (frameContext.client.added) {
                        toast(
                          'Mini app is already added, good job! Make sure to turn on notifications.'
                        )
                        console.log(
                          'Mini app is already added, skipping adding it again'
                        )
                        return
                      }
                      return frameSdk.actions.addFrame()
                    } else {
                      window.open(
                        'https://farcaster.xyz/miniapps/Qqjy9efZ-1Qu/eggs',
                        '_blank'
                      )
                    }
                  } catch (error) {
                    console.error('Error getting frame context', error)
                    window.open(
                      'https://farcaster.xyz/miniapps/Qqjy9efZ-1Qu/eggs',
                      '_blank'
                    )
                  }
                }}
              >
                <p className="uppercase">Add mini app</p>
              </PrimaryButton>
            )}
            <PrimaryButton onClick={shareEggsApp}>
              <p className="uppercase">Share</p>
            </PrimaryButton>
            {!isFrame && (
              <PrimaryButton
                onClick={() => {
                  window.open(
                    'https://farcaster.xyz/miniapps/Qqjy9efZ-1Qu/eggs',
                    '_blank'
                  )
                }}
              >
                <p className="uppercase">Open the mini app</p>
              </PrimaryButton>
            )}
            <div className="flex gap-2 text-bright-greek text-2xl justify-center items-center">
              <a
                href="https://basescan.org/address/0x712f43b21cf3e1b189c27678c0f551c08c01d150"
                target="_blank"
              >
                ca
              </a>
              <a href="https://x.com/eggsdotf" target="_blank">
                x
              </a>
              <a href="https://t.me/eggsdotfun" target="_blank">
                tg
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0">
        <NewsTicker direction={'left'} />
        <NewsTicker direction="right" />
      </div>
    </div>
  )
}
