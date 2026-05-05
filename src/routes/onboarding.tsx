import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/onboarding')({
  beforeLoad: () => {
    throw redirect({ to: '/' })
  },
})
