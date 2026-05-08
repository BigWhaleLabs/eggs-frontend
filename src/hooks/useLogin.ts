import { useCallback } from 'preact/hooks'
import toast from 'react-hot-toast'
import { useConnect } from 'wagmi'

export default function useLogin(isInMiniApp: boolean) {
  const { connect, connectors } = useConnect()

  return useCallback(() => {
    const connector =
      (isInMiniApp
        ? connectors.find((item) => item.id.includes('farcaster'))
        : undefined) ||
      connectors.find((item) => item.id === 'injected') ||
      connectors.find((item) => !item.id.includes('farcaster')) ||
      connectors[0]

    if (!connector) {
      toast.error('No wallet connector available')
      return
    }

    connect(
      { connector },
      {
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  }, [connect, connectors, isInMiniApp])
}
