import { ActionButton } from 'components/Buttons'
import useEggsHoldings from 'hooks/useEggsHoldings'
import { useModal } from 'hooks/useModal'
import toast from 'react-hot-toast'
import { formatUnits } from 'viem'

export default function Wallets() {
  const { closeModal } = useModal()

  const { isLoading: isLoadingBalances, eggBalances } = useEggsHoldings()

  return (
    <div
      className="bg-nuclear-blast p-4 pt-6 flex flex-col gap-[9px] text-center rounded-xl"
      style={{
        lineHeight: 'normal',
      }}
    >
      <p
        className="text-2xl text-bright-greek uppercase"
        style={{
          lineHeight: 'normal',
        }}
      >
        $EGGS totals
      </p>
      <p className="text-19 text-jet-0.6">
        How many $EGGS are connected to your Warpcast account?
      </p>
      <div className="h-px w-full bg-matcha-powder-0.5" />
      <div className="flex flex-col gap-1">
        <div className="flex flex-row justify-between text-19 text-bright-greek">
          <p>Wallet</p>
          <p>$EGGS</p>
        </div>
        {eggBalances.map(({ address, eggsBalance }) => (
          <div
            className="flex flex-row justify-between text-black text-19"
            key={address}
          >
            <p
              className="cursor-pointer"
              onClick={() => {
                void navigator.clipboard.writeText(address)
                toast.success('Copied to clipboard')
              }}
            >
              {`${address.slice(0, 4)}...${address.slice(-4)}`}
            </p>
            <p className="text-bright-greek">
              {isLoadingBalances
                ? 'loading...'
                : (+formatUnits(eggsBalance, 18)).toFixed(4)}
            </p>
          </div>
        ))}
      </div>
      <div className="w-full h-px bg-matcha-powder-0.5" />
      <ActionButton
        backgroundColor="bg-bright-greek"
        textColor="text-nuclear-blast"
        onClick={closeModal}
      >
        OKEY-DOKEY
      </ActionButton>
    </div>
  )
}
