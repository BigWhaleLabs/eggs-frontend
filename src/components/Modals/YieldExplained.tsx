import { ActionButton } from 'components/Buttons'
import { formatCompactNumber } from 'helpers/formatCompactNumber'
import { useModal } from 'hooks/useModal'
import useYieldWithFactor from 'hooks/useYieldFactor'

const emissionList = [
  {
    emission: '≤50k',
    threshold: '0%',
  },
  {
    emission: '50k-100k',
    threshold: '-10%',
  },
  {
    emission: '100k-150k',
    threshold: '-25%',
  },
  {
    emission: '150k-200k',
    threshold: '-35%',
  },
  {
    emission: '200k-250k',
    threshold: '-55%',
  },
  {
    emission: '250k-300k',
    threshold: '-75%',
  },
  {
    emission: '300k+',
    threshold: '-90%',
  },
]

export default function YieldExplained() {
  const { closeModal } = useModal()

  const { emission } = useYieldWithFactor()

  return (
    <div
      className="bg-nuclear-blast p-4 pt-6 flex flex-col gap-[9px] text-center rounded-xl"
      style={{
        lineHeight: 'normal',
      }}
    >
      <p className="text-49 text-bright-greek">Bok bok bak!</p>
      <p
        className="text-2xl text-bright-greek uppercase"
        style={{
          lineHeight: 'normal',
        }}
      >
        Dynamic emissions
      </p>
      <p className="text-19 text-jet-0.6">
        To reduce inflation, hens and referrals will have yield reductions based
        on how many eggs are emitted daily.
      </p>
      <div className="h-px w-full bg-matcha-powder-0.5" />
      <div className="flex flex-row justify-between text-19 text-bright-greek">
        <p>Emissions threshold</p>
        <p>Yield reductions</p>
      </div>
      {emissionList.map((item) => (
        <div className="flex flex-row justify-between text-black text-19">
          <p>{item.emission}</p>
          <p>{item.threshold}</p>
        </div>
      ))}
      <div className="w-full h-px bg-matcha-powder-0.5" />

      <p className="text-black text-19">
        CURRENT EMISSION: {formatCompactNumber(emission)}
      </p>
      <div className="w-full h-px bg-matcha-powder-0.5" />
      <p
        className="text-2xl text-bright-greek uppercase"
        style={{
          lineHeight: 'normal',
        }}
      >
        Neynar Score Multiplier
      </p>
      <p className="text-19 text-jet-0.6">
        Your yield is also affected by your Neynar score. Higher scores increase
        your egg production.
      </p>
      <div className="h-px w-full bg-matcha-powder-0.5" />
      <div className="flex flex-row justify-between text-19 text-bright-greek">
        <p>Neynar Score</p>
        <p>Yield Multiplier</p>
      </div>
      <div className="flex flex-row justify-between text-black text-19">
        <p>&lt; 0.5</p>
        <p>0.1%</p>
      </div>
      <div className="flex flex-row justify-between text-black text-19">
        <p>0.5 - 0.69</p>
        <p>0.1% - 50%</p>
      </div>
      <div className="flex flex-row justify-between text-black text-19">
        <p>0.69 - 0.9</p>
        <p>50% - 100%</p>
      </div>
      <div className="flex flex-row justify-between text-black text-19">
        <p>&gt; 0.9</p>
        <p>100%</p>
      </div>
      <div className="w-full h-px bg-matcha-powder-0.5" />
      <ActionButton
        backgroundColor="bg-bright-greek"
        textColor="text-nuclear-blast"
        onClick={closeModal}
      >
        GOT IT
      </ActionButton>
    </div>
  )
}
