import { createFileRoute } from '@tanstack/react-router'
import Onboarding from 'components/Onboarding'

export const Route = createFileRoute('/onboarding')({
  component: Onboarding,
  preload: true,
})
