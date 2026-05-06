import { useNavigate } from '@tanstack/react-router'
import {
  EggAnimations,
  frameDuration,
  hatchingFrames,
} from 'components/EggAnimation'
import Eggochi from 'components/Eggochi'
import { useEffect } from 'preact/hooks'

export default function Hatching() {
  const navigate = useNavigate()

  useEffect(() => {
    const timeout = setTimeout(
      async () => {
        await navigate({
          to: '/',
        })
      },
      hatchingFrames.length * frameDuration - 500
    )

    return () => clearTimeout(timeout)
  }, [navigate])

  return (
    <div
      className="flex flex-1 justify-center flex-col px-6 z-10 gap-3 pointer-events-none"
      style={{
        lineHeight: 'normal',
      }}
    >
      <Eggochi animation={EggAnimations.Hatching} withButtons />
      <div className="bg-nuclear-blast rounded-xl p-4 pt-6 text-33 text-center flex flex-col gap-[9px]">
        <p>😱</p>
        <p className="text-bright-greek">Your hen is hatching...</p>
      </div>
    </div>
  )
}
