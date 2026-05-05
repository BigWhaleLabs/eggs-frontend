import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/game')({
  beforeLoad: () => {
    throw redirect({ to: '/' })
  },
})
