/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_BACKEND_URL: string
  readonly VITE_BASE_RPC_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
