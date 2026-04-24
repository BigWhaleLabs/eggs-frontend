import { useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import weekday from 'dayjs/plugin/weekday'
import zalgo from 'helpers/zalgo'
import useCountdown from 'hooks/useCountdown'
import useJackpotAmount from 'hooks/useJackpotAmount'
import Arrow from 'icons/Arrow'
import { useEffect, useMemo, useState } from 'react'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(weekday)

export default function JackpotHeader({
  direction = 'forward',
}: {
  direction?: 'forward' | 'backward'
}) {
  const jackpotAmount = useJackpotAmount()
  const navigate = useNavigate()

  const [currentTime, setCurrentTime] = useState(new Date())

  const { targetDate, isDrawPeriod } = useMemo(() => {
    const now = dayjs().tz('America/Los_Angeles')
    const currentDay = now.day()
    const currentHour = now.hour()

    const isDrawPeriod =
      (currentDay === 1 && currentHour >= 14) ||
      (currentDay === 2 && currentHour < 14)

    let target

    if (isDrawPeriod) {
      target = now.day(2).hour(14).minute(0).second(0)

      if ((currentDay === 2 && currentHour >= 14) || currentDay > 2) {
        target = target.add(7, 'day')
      }
    } else {
      target = now.day(1).hour(14).minute(0).second(0)

      if ((currentDay === 1 && currentHour >= 14) || currentDay > 1) {
        target = target.add(7, 'day')
      }
    }

    return {
      targetDate: target.toDate(),
      isDrawPeriod,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime])

  const { timeLeft } = useCountdown(targetDate, 'long')

  useEffect(() => {
    if (timeLeft === 'sometimes soon') {
      setCurrentTime(new Date())
    }
  }, [timeLeft])

  const actionText = isDrawPeriod ? 'draw in' : 'claim in'

  return jackpotAmount !== null ? (
    <div
      className="rounded-xl bg-yellow-background w-full flex flex-col px-3 cursor-pointer"
      onClick={() => {
        return navigate({ to: direction === 'forward' ? '/jackpot' : '/game' })
      }}
    >
      <div className="flex justify-between items-center -mb-2">
        <div className="flex gap-4">
          {direction === 'backward' && <Arrow direction="left" />}
          <p className="uppercase text-16 text-bright-greek font-medium">
            {zalgo('Weekly jackpot')}
          </p>
        </div>
        <div className="flex items-center">
          <p className="uppercase text-28 sm:text-36 text-bright-greek font-medium">
            {Math.floor(jackpotAmount || 0)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
          </p>
          <p className="uppercase font-medium text-19 text-jackpot-secondary">
            $eggs
          </p>
          {direction === 'forward' && (
            <div className="ml-4 mb-1">
              <Arrow />
            </div>
          )}
        </div>
      </div>
      <div className="w-full h-px bg-jackpot-separator" />
      <p className="uppercase font-medium text-26 text-prickly-pink w-full text-center">
        {actionText} {timeLeft}
      </p>
    </div>
  ) : null
}
