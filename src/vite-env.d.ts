/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRIVY_APP_ID: string
  readonly VITE_PRIVY_APP_CLIENT_ID: string
  readonly VITE_GRAPHQL_BACKEND_URL: string
  readonly VITE_BASE_RPC_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
