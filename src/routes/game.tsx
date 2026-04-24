import { createFileRoute } from '@tanstack/react-router'
import Game from 'components/Game'

export const Route = createFileRoute('/game')({
  component: Game,
})
