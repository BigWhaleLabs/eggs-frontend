import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/hatching')({
  beforeLoad: () => {
    throw redirect({ to: '/' })
  },
})
