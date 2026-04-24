import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ActionButton } from 'components/Buttons'
import { EggAnimations } from 'components/EggAnimation'
import Eggochi from 'components/Eggochi'
import { upgradeStatusAtom } from 'components/Modals/LevelUpHen'
import { motion } from 'framer-motion'
import useURQLClient from 'hooks/useURQLClient'
import LevelingUp from 'icons/LevelingUp'
import { useAtom } from 'jotai'
import { getMyData } from 'queries/eggsQueries'
import { useCallback, useEffect, useState } from 'react'

export default function Hatching() {
  const navigate = useNavigate()
  const [intensityLevel, setIntensityLevel] = useState(1)
  const [upgradeStatus] = useAtom(upgradeStatusAtom)
  const [isAnimating, setIsAnimating] = useState(true)
  const [animationComplete, setAnimationComplete] = useState(false)

  const client = useURQLClient()
  const fetchHens = useCallback(
    () => client.query(getMyData, {}).toPromise(),
    [client]
  )
  const { refetch } = useQuery({
    queryKey: ['myData'],
    queryFn: fetchHens,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

  const handleCompletion = useCallback(async () => {
    if (upgradeStatus) {
      await refetch()
      await navigate({ to: '/game' })
    } else {
      setIsAnimating(false)
      setAnimationComplete(true)
      await refetch()
    }
  }, [navigate, refetch, upgradeStatus])

  const handleSkip = useCallback(async () => {
    setIsAnimating(false)

    await handleCompletion()
  }, [handleCompletion])

  useEffect(() => {
    let intensityTimers: NodeJS.Timeout[] = []
    let navigationTimer: NodeJS.Timeout

    if (isAnimating) {
      intensityTimers = [
        setTimeout(() => setIntensityLevel(2), 800),
        setTimeout(() => setIntensityLevel(3), 1600),
        setTimeout(() => setIntensityLevel(4), 2500),
      ]

      navigationTimer = setTimeout(async () => {
        setAnimationComplete(true)
        await handleCompletion()
      }, 5000)
    }

    return () => {
      intensityTimers.forEach(clearTimeout)
      if (navigationTimer) clearTimeout(navigationTimer)
    }
  }, [navigate, upgradeStatus, isAnimating, handleCompletion])

  const loadingVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const dotVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: [0, 1, 0],
      y:
        intensityLevel >= 3
          ? [-2, -5, -2]
          : intensityLevel >= 2
            ? [-1, -3, -1]
            : 0,
      scale: intensityLevel >= 3 ? [1, 1.2, 1] : 1,
      transition: {
        repeat: isAnimating ? Infinity : 0,
        duration: 0.6 - intensityLevel * 0.1,
      },
    },
  }

  const getEggAnimation = () => {
    switch (intensityLevel) {
      case 1:
        return {
          scale: [1, 1.03, 0.98, 1.03, 1],
          rotate: [0, -2, 0, 2, 0],
          y: [0, -3, 0, -3, 0],
          duration: 1.2,
        }
      case 2:
        return {
          scale: [1, 1.06, 0.96, 1.06, 1],
          rotate: [0, -4, 0, 4, 0],
          y: [0, -6, 0, -6, 0],
          duration: 0.9,
        }
      case 3:
        return {
          scale: [1, 1.08, 0.94, 1.08, 1],
          rotate: [0, -6, 0, 6, 0],
          y: [0, -9, 0, -9, 0],
          duration: 0.6,
        }
      case 4:
        return {
          scale: [1, 1.1, 0.92, 1.1, 1],
          rotate: [0, -8, 0, 8, 0],
          y: [0, -12, 0, -12, 0],
          duration: 0.4,
        }
      default:
        return {
          scale: [1, 1.03, 0.98, 1.03, 1],
          rotate: [0, -2, 0, 2, 0],
          y: [0, -3, 0, -3, 0],
          duration: 1.2,
        }
    }
  }

  const eggAnim = getEggAnimation()

  return (
    <div
      className="flex flex-1 justify-center flex-col px-6 z-10 gap-3 "
      style={{
        lineHeight: 'normal',
      }}
    >
      <div className="relative flex justify-center">
        <motion.div
          className="absolute left-1/2 top-1/2 z-20"
          style={{
            marginLeft: -120,
            marginTop: -96,
            x: '-50%',
            y: '-50%',
          }}
          animate={{
            rotate: isAnimating ? 360 : 0,
            scale:
              isAnimating && intensityLevel >= 3
                ? [1, 1.15, 1]
                : isAnimating && intensityLevel >= 2
                  ? [1, 1.08, 1]
                  : 1,
          }}
          transition={{
            rotate: {
              duration: 2.2 - intensityLevel * 0.5,
              repeat: isAnimating ? Infinity : 0,
              ease: 'linear',
            },
            scale: {
              duration: 0.3,
              repeat: isAnimating ? Infinity : 0,
              repeatType: 'reverse',
              ease: 'easeInOut',
            },
          }}
        >
          <LevelingUp />
        </motion.div>
        <motion.div
          animate={{
            scale: isAnimating ? eggAnim.scale : 1,
            rotate: isAnimating ? eggAnim.rotate : 0,
            y: isAnimating ? eggAnim.y : 0,
          }}
          transition={{
            duration: eggAnim.duration,
            repeat: isAnimating ? Infinity : 0,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        >
          <Eggochi animation={EggAnimations.Hatching} withButtons />
        </motion.div>
      </div>
      <motion.div
        className="bg-nuclear-blast rounded-xl p-4 pt-6 text-33 text-center flex flex-col gap-[9px] items-center justify-center"
        animate={{
          opacity: isAnimating ? [1, 0.75, 1] : 1,
          scale:
            isAnimating && intensityLevel >= 3
              ? [1, 1.03, 1]
              : isAnimating && intensityLevel >= 2
                ? [1, 1.02, 1]
                : 1,
          x:
            isAnimating && intensityLevel >= 3
              ? [-3, 3, -3, 3, 0]
              : isAnimating && intensityLevel >= 2
                ? [-2, 2, -2, 2, 0]
                : 0,
        }}
        transition={{
          duration: 1.2 - intensityLevel * 0.25,
          repeat: isAnimating ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        <motion.p
          animate={{
            scale:
              isAnimating && intensityLevel >= 2
                ? intensityLevel >= 3
                  ? [1, 1.3, 1]
                  : [1, 1.2, 1]
                : [1, 1.1, 1],
          }}
          transition={{
            duration: 0.4 - intensityLevel * 0.05,
            repeat: isAnimating ? Infinity : 0,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        >
          😱
        </motion.p>
        <p className="text-bright-greek flex items-center justify-center text-33 w-64">
          {animationComplete && !upgradeStatus
            ? 'Your hen failed to level up!'
            : 'Your hen is leveling up'}
          {!animationComplete && (
            <motion.span
              variants={loadingVariants}
              initial="initial"
              animate={isAnimating ? 'animate' : 'initial'}
              className="inline-flex -mr-4"
            >
              <motion.span variants={dotVariants}>.</motion.span>
              <motion.span variants={dotVariants}>.</motion.span>
              <motion.span variants={dotVariants}>.</motion.span>
            </motion.span>
          )}
        </p>
        {animationComplete && !upgradeStatus && (
          <p className="text-19 text-black">
            Remember the "success rate"? You didn't luck out. Fees are burned
            and are non-refundable. Try your luck again next time! Hey, at least
            you got a free Megapot ticket and 30 $EGGS jackpot tickets 🙏
          </p>
        )}
        <div className="z-10">
          <ActionButton
            backgroundColor="bg-bright-greek"
            onClick={
              animationComplete ? () => navigate({ to: '/game' }) : handleSkip
            }
          >
            <p>{animationComplete ? 'GO BACK' : 'SKIP'}</p>
          </ActionButton>
        </div>

        {isAnimating && intensityLevel >= 3 && (
          <motion.div
            className="absolute inset-0 bg-white rounded-xl"
            animate={{ opacity: [0, intensityLevel >= 4 ? 0.3 : 0.15, 0] }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
              repeatDelay: intensityLevel >= 4 ? 0.2 : 0.5,
            }}
          />
        )}
      </motion.div>
    </div>
  )
}
