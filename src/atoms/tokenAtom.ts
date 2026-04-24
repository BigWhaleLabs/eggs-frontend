import { jsonStorage } from 'helpers/persistedAtom'
import { atom, createStore, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback } from 'react'

export function getToken() {
  if (typeof window === 'undefined') return ''
  return jsonStorage().getItem('AuthToken', '') as string
}

export const tokenAtom = atom(getToken())

export const tokenStore = createStore()

export function useSetToken() {
  const setTokenAtom = useSetAtom(tokenAtom)

  const setToken = useCallback(
    (token: string) => {
      setTokenAtom(token)
      if (typeof window === 'undefined') return
      jsonStorage().setItem('AuthToken', token)
    },
    [setTokenAtom]
  )

  return setToken
}

export const onboardingAtom = atomWithStorage('onboarding', false)
export const soundEnabledAtom = atomWithStorage('soundEnabled', true)
