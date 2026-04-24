import { useNavigate } from '@tanstack/react-router'
import { onboardingAtom } from 'atoms/tokenAtom'
import { ActionButton } from 'components/Buttons'
import { useSetAtom } from 'jotai'

export default function Onboarding() {
  const navigate = useNavigate()
  const setOnboarding = useSetAtom(onboardingAtom)

  return (
    <div
      className="px-4 flex flex-col justify-center flex-1 z-10 gap-3"
      style={{
        lineHeight: 'normal',
      }}
    >
      <div
        className="bg-nuclear-blast flex flex-col rounded-xl p-4 pt-6 gap-[9px]"
        style={{
          boxShadow: '0px 0px 8px 0px #FFB700',
        }}
      >
        <p className="text-49 text-bright-greek text-center">Bok bak!</p>
        <p
          className="text-center text-2xl text-bright-greek"
          style={{
            lineHeight: 'normal',
          }}
        >
          Earn <span className="text-prickly-pink">$EGGS</span> daily on
          eggs.name
        </p>
        <div className="w-full h-px bg-matcha-powder-0.5" />
        <ul className="flex flex-col gap-3 text-19">
          <li>
            🐓
            <span className="text-jet-0.6">
              Hatch hens to lay $EGGS daily.{' '}
            </span>
          </li>
          <li>
            🏆
            <span className="text-jet-0.6">
              Level up your hens to lay more $EGGS.
            </span>
          </li>
          <li>
            🍆
            <span className="text-jet-0.6">
              To get started, you will need a rooster (cock code) from someone
              else.
            </span>
          </li>
          <li>
            🤝
            <span className="text-jet-0.6">
              You have 3 roosters (cock codes) that refresh daily to invite
              frens.
            </span>
          </li>
        </ul>
        <div className="w-full h-px bg-matcha-powder-0.5" />
        <ActionButton
          flex
          backgroundColor="bg-bright-greek"
          onClick={async () => {
            setOnboarding(true)
            await navigate({
              to: '/game',
            })
          }}
        >
          GO TO MY COOP
        </ActionButton>
      </div>
    </div>
  )
}
