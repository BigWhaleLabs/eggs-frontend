import { createFileRoute } from '@tanstack/react-router'
import Hatching from 'components/Hatching'

export const Route = createFileRoute('/hatching')({
  component: Hatching,
  preload: true,
})
