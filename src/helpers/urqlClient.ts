import { Client, fetchExchange } from 'urql'

export function getLegacyAuthToken() {
  if (typeof window === 'undefined') return ''

  const token = window.localStorage.getItem('AuthToken')
  if (!token) return ''

  try {
    const parsed = JSON.parse(token)
    return typeof parsed === 'string' ? parsed : ''
  } catch {
    return token
  }
}

export default function initURQLClient() {
  if (typeof window === 'undefined')
    return new Client({
      url: import.meta.env['VITE_GRAPHQL_BACKEND_URL'],
      exchanges: [],
    })

  return new Client({
    suspense: true,
    url: import.meta.env['VITE_GRAPHQL_BACKEND_URL'],
    exchanges: [fetchExchange],
    fetchOptions: () => {
      const authToken = getLegacyAuthToken()

      return {
        headers: {
          ...(authToken ? { authorization: authToken } : {}),
          'replay-token': crypto.randomUUID(),
          source: 'browser',
        },
      }
    },
  })
}
