import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import FarcasterFrameLogin from 'components/FarcasterFrameLogin'
import queryClient from 'helpers/reactQueryConfig'
import wagmiConfig from 'helpers/wagmiConfig'
import useURQLClient from 'hooks/useURQLClient'
import { render } from 'preact'
import { Toaster } from 'react-hot-toast'
import { routeTree } from 'routeTree.gen'
import { Provider as UrqlProvider } from 'urql'
import { WagmiProvider } from 'wagmi'

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function RootGQLWrapper({ children }: { children: React.ReactNode }) {
  const client = useURQLClient()

  return <UrqlProvider value={client}>{children}</UrqlProvider>
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rootElement = document.getElementById('app')!

const privyConfig = {
  clientId: import.meta.env['VITE_PRIVY_APP_CLIENT_ID'],
  appId: import.meta.env['VITE_PRIVY_APP_ID'],
  config: {
    loginMethods: ['farcaster'],
    embeddedWallets: {
      loginMethods: ['farcaster'],
      embeddedWallets: {
        createOnLogin: 'all-users',
      },
    },
  },
} as {
  clientId: string
  appId: string
  config: PrivyClientConfig
}

if (!rootElement.innerHTML) {
  render(
    <PrivyProvider
      clientId={privyConfig.clientId}
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      <RootGQLWrapper>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <Toaster />
            <FarcasterFrameLogin />
            <RouterProvider router={router} />
          </WagmiProvider>
        </QueryClientProvider>
      </RootGQLWrapper>
    </PrivyProvider>,
    rootElement
  )
}
