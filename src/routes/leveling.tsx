import { createFileRoute } from '@tanstack/react-router'
import Leveling from 'components/Hatching/Leveling'

export const Route = createFileRoute('/leveling')({
  component: Leveling,
  preload: true,
})
