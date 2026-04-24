import frameSdk from '@farcaster/frame-sdk'
import { usePrivy } from '@privy-io/react-auth'
import { useLoginToFrame } from '@privy-io/react-auth/farcaster'
import useConnectFarcaster from 'hooks/useConnectFarcaster'
import { useEffect, useState } from 'preact/hooks'

export default function FarcasterFrameLogin() {
  const { ready, authenticated } = usePrivy()
  const { initLoginToFrame, loginToFrame } = useLoginToFrame()
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const connectFarcaster = useConnectFarcaster()
  useEffect(() => {
    const load = async () => {
      await frameSdk.context
      console.log('FarcasterFrameLogin: reporting ready')
      await frameSdk.actions.ready({})
      await connectFarcaster()
    }
    if (frameSdk && !isSDKLoaded) {
      setIsSDKLoaded(true)
      void load()
    }
  }, [connectFarcaster, isSDKLoaded])
  useEffect(() => {
    console.log(
      'FarcasterFrameLogin: ready',
      ready,
      'authenticated',
      authenticated
    )
    if (ready && !authenticated) {
      const login = async () => {
        const context = await frameSdk.context
        if (!context.user.fid) {
          console.log('FarcasterFrameLogin: Not a frame')
          return
        }
        console.log('FarcasterFrameLogin: Initializing login')
        // Initialize a new login attempt to get a nonce for the Farcaster wallet to sign
        const { nonce } = await initLoginToFrame()
        // Request a signature from Warpcast
        const result = await frameSdk.actions.signIn({
          nonce: nonce,
          acceptAuthAddress: true,
        })
        // Send the received signature from Warpcast to Privy for authentication
        await loginToFrame({
          message: result.message,
          signature: result.signature,
        })
        await connectFarcaster()
        console.log('FarcasterFrameLogin: Logged in')
      }
      if (frameSdk) {
        console.log('FarcasterFrameLogin: Logging in')
        void login()
      } else {
        console.error('FarcasterFrameLogin: Farcaster SDK not found')
      }
    }
  }, [ready, authenticated, initLoginToFrame, loginToFrame, connectFarcaster])
  return <></>
}
