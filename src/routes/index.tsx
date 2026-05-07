import { sdk as miniAppSdk } from '@farcaster/miniapp-sdk'
import { createFileRoute } from '@tanstack/react-router'
import { ActionButton, PrimaryButton } from 'components/Buttons'
import EggsInfo from 'components/EggsInfo'
import useLogin from 'hooks/useLogin'
import TimerWave from 'icons/TimerWave'
import egg from 'images/egg.webp'
import { useEffect } from 'preact/hooks'
import toast from 'react-hot-toast'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export const Route = createFileRoute('/')({
  component: ResponsiveImageContainer,
})

function ResponsiveImageContainer() {
  const login = useLogin()
  const account = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    const signalMiniAppReady = async () => {
      const hasMiniAppHost =
        Boolean(window.ReactNativeWebView) || window !== window.parent

      if (!hasMiniAppHost) return

      try {
        await miniAppSdk.actions.ready()
      } catch (error) {
        console.error('Farcaster Mini App ready() failed', error)
      }
    }

    void signalMiniAppReady()
  }, [])

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
      <div className="h-screen w-full flex items-center justify-center px-12 flex-col">
        <div className="relative flex flex-col items-center justify-center w-full max-w-[420px] z-10">
          <img
            src={egg}
            alt="$EGGS"
            className="w-28 h-28 object-contain drop-shadow-xl mb-5"
          />
          <div className="bg-nuclear-blast rounded-xl p-5 w-full shadow-[0px_0px_24px_0px_rgba(241,38,150,0.45)]">
            <p className="text-4xl text-jet text-center uppercase">$EGGS</p>
            <p className="text-19 text-jet-0.6 text-center mt-2">
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
                {connectors.map((connector) => (
                  <ActionButton
                    key={connector.uid}
                    disabled={isPending}
                    flex
                    backgroundColor="bg-bright-greek-0.5"
                    onClick={() => {
                      connect(
                        { connector },
                        {
                          onError: (error) => {
                            toast.error(error.message)
                          },
                        }
                      )
                    }}
                  >
                    <p>{connector.name}</p>
                  </ActionButton>
                ))}
              </div>
            )}
          </div>
          <div
            className="flex flex-col mt-4 flex-1 w-full md:max-w-72"
            style={{
              gap: 10,
            }}
          >
            {account.isConnected && (
              <PrimaryButton
                onClick={() => {
                  disconnect()
                }}
              >
                <p className="uppercase">Disconnect</p>
              </PrimaryButton>
            )}
            <div className="flex gap-2 text-bright-greek text-2xl justify-center items-center">
              <a
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
