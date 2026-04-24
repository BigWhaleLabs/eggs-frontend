import { getAccessToken, useLogin, usePrivy } from '@privy-io/react-auth'
import { tokenAtom, useSetToken } from 'atoms/tokenAtom'
import { graphql } from 'helpers/graphql'
import useLogout from 'hooks/useLogout'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation } from 'urql'

const loginWithPrivy = graphql(`
  mutation loginWithPrivy($token: String!) {
    loginWithPrivy(token: $token) {
      token
      user {
        id
        username
      }
    }
  }
`)

export default function usePrivyLogin(
  onSuccess?: ({ newUser }: { newUser: boolean }) => void
) {
  // State
  const [loading, setLoading] = useState(false)
  const setToken = useSetToken()
  const token = useAtomValue(tokenAtom)
  // Mutations
  const [, loginWithPrivyOnBackend] = useMutation(loginWithPrivy)
  // Hooks
  const logout = useLogout()
  const loginCallback = useCallback(
    async ({
      isNewUser,
      wasAlreadyAuthenticated,
      loginMethod,
    }: {
      isNewUser: boolean
      wasAlreadyAuthenticated: boolean
      loginMethod: string | null
    }) => {
      try {
        // Set loading
        setLoading(true)
        // Login to Eggs
        const token = await getAccessToken()
        // Check if Privy is logged in
        if (!token) throw new Error('Privy token not found')
        // Login to Eggs
        const { data, error } = await loginWithPrivyOnBackend({
          token,
        })
        if (error || !data?.loginWithPrivy) {
          throw error || new Error(`Failed to login with ${loginMethod}`)
        }
        // Save Eggs token
        setToken(data.loginWithPrivy.token)
        // Call success callback
        if (!wasAlreadyAuthenticated) {
          onSuccess?.({
            newUser: isNewUser,
          })
        }
      } catch (error) {
        console.error(error)
        toast.error(
          `Failed to login: ${error instanceof Error ? error.message : error}`
        )
        await logout()
        throw error
      } finally {
        setLoading(false)
      }
    },
    [loginWithPrivyOnBackend, setToken, onSuccess, logout]
  )

  const { login: privyLogin } = useLogin({
    onComplete: loginCallback,
    onError: () => {
      setLoading(false)
    },
  })

  const { ready, authenticated } = usePrivy()

  const login = useCallback(() => {
    setLoading(true)
    privyLogin()
  }, [privyLogin])

  useEffect(() => {
    // If it's in the process of logging in, do nothing
    if (loading) return
    // If privy isn't logged in, do nothing
    if (!ready || !authenticated) return
    // If token is here, we're done
    if (token) return
    // If Privy is logged in, but we have no token and aren't in the process of logging in, log in
    void loginCallback({
      isNewUser: false,
      wasAlreadyAuthenticated: true,
      loginMethod: null,
    })
  }, [ready, authenticated, token, loading, loginCallback])

  return { login, loading }
}
