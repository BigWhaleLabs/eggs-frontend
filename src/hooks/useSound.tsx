import { soundEnabledAtom } from 'atoms/tokenAtom'
import { useAtom } from 'jotai'
import { useEffect, useMemo, useRef } from 'preact/hooks'

type Sound = 'squeeze' | 'unsqueeze'

export default function useSound(
  sound: Sound,
  loop = false,
  playsFromStart = true
) {
  const soundRef = useRef<HTMLAudioElement | null>(null)
  const [soundEnabled] = useAtom(soundEnabledAtom)

  useEffect(() => {
    soundRef.current = new Audio(`/sounds/${sound}.wav`)
    soundRef.current.loop = loop
  }, [sound, loop])

  const returnData = useMemo(() => {
    return {
      playSound: () => {
        if (!soundRef.current) return
        if (playsFromStart) {
          soundRef.current.currentTime = 0
        }
        if (!soundEnabled) return
        return soundRef.current.play()
      },
      pauseSound: () => {
        if (!soundRef.current) return
        soundRef.current.pause()
      },
      soundRef,
    }
  }, [playsFromStart, soundEnabled])

  return returnData
}
