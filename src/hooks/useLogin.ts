import { useCallback } from 'preact/hooks'
import { useConnect } from 'wagmi'

export default function useLogin() {
  const { connect, connectors } = useConnect()

  return useCallback(() => {
    const connector =
      connectors.find((item) => item.id.includes('farcaster')) ||
      connectors.find((item) => item.id === 'injected') ||
      connectors[0]

    if (!connector) return
    connect({ connector })
  }, [connect, connectors])
}
