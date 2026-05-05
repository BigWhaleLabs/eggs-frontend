import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/leveling')({
  beforeLoad: () => {
    throw redirect({ to: '/' })
  },
})
