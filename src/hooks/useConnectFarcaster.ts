import farcasterMiniapp from '@farcaster/miniapp-wagmi-connector'
import { useConnect } from 'wagmi'

export default function useConnectFarcaster() {
  const { connectAsync } = useConnect()
  return () => {
    return connectAsync({ connector: farcasterMiniapp() })
  }
}
