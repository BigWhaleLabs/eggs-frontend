import { Client, fetchExchange } from 'urql'

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
      return {
        headers: {
          'replay-token': crypto.randomUUID(),
          source: 'browser',
        },
      }
    },
  })
}
