import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/use-my-cock/$cockCode')({
  beforeLoad: () => {
    throw redirect({ to: '/' })
  },
})
