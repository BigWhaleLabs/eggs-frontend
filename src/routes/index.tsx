import { sdk as miniAppSdk } from '@farcaster/miniapp-sdk'
import { createFileRoute } from '@tanstack/react-router'
import { PrimaryButton } from 'components/Buttons'
import EggsInfo from 'components/EggsInfo'
import useLogin from 'hooks/useLogin'
import TimerWave from 'icons/TimerWave'
import { useEffect, useRef, useState } from 'preact/hooks'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export const Route = createFileRoute('/')({
  component: ResponsiveImageContainer,
})

const miniAppReadyRetryMs = [0, 250, 1000, 2500]

function ResponsiveImageContainer() {
  const [isInMiniApp, setIsInMiniApp] = useState(false)
  const didTryMiniAppConnect = useRef(false)
  const login = useLogin(isInMiniApp)
  const account = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    let didSignalReady = false
    const timeoutIds: number[] = []

    const signalMiniAppReady = async () => {
      if (didSignalReady) return

      try {
        await miniAppSdk.actions.ready()
        didSignalReady = true

        timeoutIds.forEach((timeoutId) => {
          window.clearTimeout(timeoutId)
        })
      } catch (error) {
        console.error('Farcaster Mini App ready() failed', error)
      }
    }

    miniAppReadyRetryMs.forEach((retryMs) => {
      timeoutIds.push(
        window.setTimeout(() => {
          void signalMiniAppReady()
        }, retryMs)
      )
    })

    return () => {
      didSignalReady = true
      timeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    miniAppSdk
      .isInMiniApp()
      .then((isMiniApp) => {
        if (!isMounted) return
        setIsInMiniApp(isMiniApp)
      })
      .catch(() => {
        if (!isMounted) return
        setIsInMiniApp(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (
      !isInMiniApp ||
      account.isConnected ||
      isPending ||
      didTryMiniAppConnect.current
    ) {
      return
    }

    const farcasterConnector = connectors.find((connector) =>
      connector.id.includes('farcaster')
    )

    if (!farcasterConnector) return

    didTryMiniAppConnect.current = true
    connect({ connector: farcasterConnector })
  }, [account.isConnected, connect, connectors, isInMiniApp, isPending])

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
          <p className="text-2xl md:text-4xl text-jet">Shutdown wallet tools</p>
        </div>
      </div>
      <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex items-center justify-center px-4 py-6 flex-col">
        <div className="relative flex flex-col items-center justify-center w-full max-w-[320px] sm:max-w-[420px] z-10">
          <div className="bg-nuclear-blast rounded-xl p-4 w-full shadow-[0px_0px_24px_0px_rgba(241,38,150,0.45)]">
            <p className="text-28 sm:text-4xl text-jet text-center uppercase">
              $EGGS wallet tools
            </p>
            <p className="text-16 sm:text-19 text-jet-0.6 text-center mt-2">
              Unstake staked $EGGS and turn existing chickens into NFTs.
            </p>
            {account.isConnected ? (
              <div className="mt-5">
                <EggsInfo />
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-2">
                <PrimaryButton
                  disabled={isPending || !connectors.length}
                  onClick={() => {
                    login()
                  }}
                  className="w-full disabled:opacity-50"
                >
                  <p className="uppercase">
                    {isPending ? 'Connecting' : 'Connect wallet'}
                  </p>
                </PrimaryButton>
              </div>
            )}
          </div>
          <div
            className="flex flex-col mt-4 flex-1 w-full md:max-w-72"
            style={{
              gap: 10,
            }}
          >
            {account.isConnected && !isInMiniApp && (
              <PrimaryButton
                onClick={() => {
                  disconnect()
                }}
              >
                <p className="uppercase">Disconnect</p>
              </PrimaryButton>
            )}
            <div className="flex gap-2 justify-center items-center">
              <a
                className="rounded-full bg-jet px-4 py-2 text-lg uppercase text-bright-greek"
                href="https://basescan.org/address/0x712f43b21cf3e1b189c27678c0f551c08c01d150"
                target="_blank"
              >
                contract
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
