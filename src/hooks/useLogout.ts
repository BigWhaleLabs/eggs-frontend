import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from '@tanstack/react-router'
import { useSetToken } from 'atoms/tokenAtom'
import { useCallback } from 'preact/hooks'

export default function useLogout() {
  const { logout: privyLogout } = usePrivy()
  const setToken = useSetToken()
  const navigate = useNavigate()
  const logout = useCallback(async () => {
    await privyLogout()
    setToken('')
    await navigate({
      to: '/',
    })
  }, [navigate, privyLogout, setToken])
  return logout
}
