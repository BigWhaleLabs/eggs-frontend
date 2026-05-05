import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/jackpot')({
  beforeLoad: () => {
    throw redirect({ to: '/' })
  },
})
