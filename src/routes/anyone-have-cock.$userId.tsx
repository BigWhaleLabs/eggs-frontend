import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/anyone-have-cock/$userId')({
  beforeLoad: () => {
    throw redirect({ to: '/' })
  },
})
