import useSound from 'hooks/useSound'
import chicken0 from 'icons/chicken/0'
import chicken1 from 'icons/chicken/1'
import chicken2 from 'icons/chicken/2'
import earned0 from 'icons/earned/0'
import earned1 from 'icons/earned/1'
import earned2 from 'icons/earned/2'
import earned3 from 'icons/earned/3'
import earned4 from 'icons/earned/4'
import earned5 from 'icons/earned/5'
import earned6 from 'icons/earned/6'
import earned7 from 'icons/earned/7'
import egg0 from 'icons/egg/0'
import egg1 from 'icons/egg/1'
import hatcing0 from 'icons/hatching/0'
import hatcing1 from 'icons/hatching/1'
import hatcing10 from 'icons/hatching/10'
import hatcing11 from 'icons/hatching/11'
import hatcing2 from 'icons/hatching/2'
import hatcing3 from 'icons/hatching/3'
import hatcing4 from 'icons/hatching/4'
import hatcing5 from 'icons/hatching/5'
import hatcing6 from 'icons/hatching/6'
import hatcing7 from 'icons/hatching/7'
import hatcing8 from 'icons/hatching/8'
import hatcing9 from 'icons/hatching/9'
import { memo } from 'preact/compat'
import { useEffect, useState } from 'preact/hooks'

const eggFrames = [egg1, egg0] as const

export const frameDuration = 1000

export const hatchingFrames = [
  hatcing0,
  hatcing1,
  hatcing2,
  hatcing3,
  hatcing4,
  hatcing5,
  hatcing6,
  hatcing7,
  hatcing8,
  hatcing9,
  hatcing10,
  hatcing11,
] as const

const chickenFrames = [
  chicken0,
  chicken1,
  chicken2,
  chicken0,
  chicken2,
] as const

const earnedEggsFrames = [
  earned0,
  earned1,
  earned2,
  earned3,
  earned4,
  earned5,
  earned6,
  earned7,
] as const

export enum EggAnimations {
  Hatching,
  Chicken,
  EarnedEggs,
  Egg,
}

const framesMap = {
  [EggAnimations.Hatching]: hatchingFrames,
  [EggAnimations.Chicken]: chickenFrames,
  [EggAnimations.EarnedEggs]: earnedEggsFrames,
  [EggAnimations.Egg]: eggFrames,
}

function EggAnimation({
  animation = EggAnimations.Hatching,
}: {
  animation: EggAnimations
}) {
  const [squeeze, setSqueeze] = useState(false)
  const [frame, setFrame] = useState(0)
  const [animationSelected, setAnimationSelected] = useState(animation)

  const { playSound: playSqueezeSound } = useSound('squeeze')
  const { playSound: playUnsqueezeSound } = useSound('unsqueeze')

  useEffect(() => {
    const timeout = setInterval(async () => {
      setSqueeze((prevSqueeze) => !prevSqueeze)
      try {
        if (squeeze) {
          await playSqueezeSound()
        } else {
          await playUnsqueezeSound()
        }
      } catch {
        // Do nothing
      }
    }, frameDuration)

    return () => clearTimeout(timeout)
  }, [playSqueezeSound, playUnsqueezeSound, squeeze])

  const animationFrames = framesMap[animationSelected]

  const Frame = animationFrames[frame]

  useEffect(() => {
    if (frame === hatchingFrames.length - 1) {
      setAnimationSelected(EggAnimations.Chicken)
      setFrame(0)
    }
    if (frame === earnedEggsFrames.length - 1) {
      setAnimationSelected(EggAnimations.Chicken)
      setFrame(0)
    }
  }, [frame])

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prevFrame) => (prevFrame + 1) % animationFrames.length)
    }, frameDuration)

    return () => clearInterval(interval)
  }, [animationFrames.length, animationSelected])

  return <Frame />
}

export default memo(EggAnimation)
