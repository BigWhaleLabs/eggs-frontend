import { Client, fetchExchange } from 'urql'

const DEFAULT_GRAPHQL_BACKEND_URL = 'https://backend.eggs.name/'

export function getGraphqlBackendUrl() {
  return (
    import.meta.env['VITE_GRAPHQL_BACKEND_URL'] || DEFAULT_GRAPHQL_BACKEND_URL
  )
}

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
  const graphqlBackendUrl = getGraphqlBackendUrl()

  if (typeof window === 'undefined')
    return new Client({
      url: graphqlBackendUrl,
      exchanges: [],
    })

  return new Client({
    suspense: true,
    url: graphqlBackendUrl,
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
