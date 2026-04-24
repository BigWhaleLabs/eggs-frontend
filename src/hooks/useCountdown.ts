import { useCallback, useEffect, useState } from 'react'

export default function useCountdown(
  target: Date,
  type: 'long' | 'short' = 'long'
) {
  const [timeLeft, setTimeLeft] = useState('')

  const updateTimeLeft = useCallback(() => {
    const now = new Date().getTime()
    const targetDate = target.getTime()
    const difference = targetDate - now

    if (now > targetDate) {
      setTimeLeft('sometimes soon')
      return
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((difference / 1000 / 60) % 60)
    const seconds = Math.floor((difference / 1000) % 60)

    setTimeLeft(
      type === 'long'
        ? `${days}d ${hours}h ${minutes}m ${seconds}s`
        : `${hours}h ${minutes}m ${seconds}s`
    )
  }, [target, type])

  useEffect(() => {
    updateTimeLeft()

    const timer = setInterval(() => {
      updateTimeLeft()
    }, 1000)

    return () => clearInterval(timer)
  }, [updateTimeLeft])

  return { timeLeft }
}
