import { ActionButton } from 'components/Buttons'
import DottedInfo from 'components/DottedInfo'
import { formatUnits } from 'viem'

const eggFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
  minimumFractionDigits: 0,
})

export function formatEggAmount(value?: bigint) {
  if (value === undefined) return '0'
  return eggFormatter.format(Number(formatUnits(value, 18)))
}

export function parseChickenSerialId(value: string) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) return null
  return parsed
}

export function extractErrorMessage(error: unknown) {
  const txError = error as {
    cause?: { shortMessage?: string }
    case?: { detail?: string; error?: string; message?: string }
    data?: { message?: string }
    message?: string
    reason?: string
  }

  return (
    txError?.cause?.shortMessage ||
    txError?.case?.detail ||
    txError?.case?.message ||
    txError?.data?.message ||
    txError?.case?.error ||
    txError?.message ||
    txError?.reason ||
    'Unknown error'
  )
}

export default function ShutdownActionsView({
  address,
  chickenSerialId,
  hasChickenMintAllowance,
  isMintingChicken,
  isUnstaking,
  onChickenSerialIdChange,
  onCopyAddress,
  onMintChicken,
  onUnstake,
  stakedEggs,
  walletEggs,
}: {
  address: `0x${string}`
  chickenSerialId: string
  hasChickenMintAllowance: boolean
  isMintingChicken: boolean
  isUnstaking: boolean
  onChickenSerialIdChange: (value: string) => void
  onCopyAddress: () => void
  onMintChicken: () => void
  onUnstake: () => void
  stakedEggs: bigint | undefined
  walletEggs: bigint | undefined
}) {
  const hasStake = !!stakedEggs && stakedEggs > 0n
  const hasSerialId = !!parseChickenSerialId(chickenSerialId)

  return (
    <div
      className="flex flex-col gap-3"
      style={{
        lineHeight: 'normal',
      }}
    >
      <button
        className="text-19 text-jet-0.6 text-center"
        onClick={onCopyAddress}
      >
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </button>

      <div className="flex flex-col gap-2">
        <DottedInfo info="STAKED" value={formatEggAmount(stakedEggs)} />
        <DottedInfo info="WALLET" value={formatEggAmount(walletEggs)} />
      </div>

      <div className="h-px w-full bg-matcha-powder-0.5" />

      <section className="flex flex-col gap-2">
        <p className="text-26 text-jet uppercase">Unstake</p>
        <p className="text-16 text-jet-0.6">
          Withdraw all staked $EGGS from the contract to this wallet.
        </p>
        <ActionButton
          disabled={!hasStake || isUnstaking}
          flex
          backgroundColor="bg-bright-greek-0.5"
          textColor={hasStake && !isUnstaking ? 'text-bright-greek' : undefined}
          onClick={onUnstake}
        >
          <p>{isUnstaking ? 'UNSTAKING...' : 'UNSTAKE ALL $EGGS'}</p>
        </ActionButton>
      </section>

      <div className="h-px w-full bg-matcha-powder-0.5" />

      <section className="flex flex-col gap-2">
        <p className="text-26 text-jet uppercase">Chicken NFT</p>
        <p className="text-16 text-jet-0.6">
          Enter an existing chicken serial ID and mint it to the connected
          wallet.
        </p>
        <input
          aria-label="Chicken serial ID"
          className="w-full rounded-lg border border-matcha-powder-0.5 bg-yellow-background px-3 py-2 text-2xl text-jet outline-none"
          inputMode="numeric"
          onInput={(event) => {
            onChickenSerialIdChange(event.currentTarget.value)
          }}
          placeholder="Chicken serial ID"
          value={chickenSerialId}
        />
        <p className="text-15 text-jet-0.6">
          {hasChickenMintAllowance
            ? 'Mint allowance is ready.'
            : 'Minting may first ask for the contract allowance.'}
        </p>
        <ActionButton
          disabled={!hasSerialId || isMintingChicken}
          flex
          backgroundColor="bg-bright-greek-0.5"
          textColor={
            hasSerialId && !isMintingChicken ? 'text-bright-greek' : undefined
          }
          onClick={onMintChicken}
        >
          <p>{isMintingChicken ? 'MINTING...' : 'TURN INTO NFT'}</p>
        </ActionButton>
      </section>
    </div>
  )
}
