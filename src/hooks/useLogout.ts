import { useNavigate } from '@tanstack/react-router'
import { useSetToken } from 'atoms/tokenAtom'
import { useCallback } from 'preact/hooks'
import { useDisconnect } from 'wagmi'

export default function useLogout() {
  const { disconnectAsync } = useDisconnect()
  const setToken = useSetToken()
  const navigate = useNavigate()
  const logout = useCallback(async () => {
    await disconnectAsync()
    setToken('')
    await navigate({
      to: '/',
    })
  }, [disconnectAsync, navigate, setToken])
  return logout
}
