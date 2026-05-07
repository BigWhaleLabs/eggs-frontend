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

export type ShutdownChicken = {
  id: string
  level: number
  name: string
  onchainOwnerAddress: string | null
  serialId: number
}

export type ChickenMintPhase =
  | 'idle'
  | 'approving'
  | 'minting'
  | 'success'
  | 'error'

export type ChickenMintState = {
  message?: string
  phase: ChickenMintPhase
}

export function getChickenMintActionLabel({
  hasChickenMintAllowance,
  mintState,
}: {
  hasChickenMintAllowance: boolean
  mintState?: ChickenMintState
}) {
  if (mintState?.phase === 'approving') return 'APPROVING'
  if (mintState?.phase === 'minting') return 'MINTING'
  if (mintState?.phase === 'success') return 'MINTED'
  if (!hasChickenMintAllowance) return 'APPROVE + MINT'
  return 'TURN INTO NFT'
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

export function getShutdownChickensErrorMessage(error: unknown) {
  const message = extractErrorMessage(error)
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes('access denied') ||
    normalizedMessage.includes('not authorized') ||
    normalizedMessage.includes('unauthorized')
  ) {
    return 'No legacy Eggs chicken session found in this browser.'
  }

  if (
    normalizedMessage.includes('[network]') ||
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('unexpected end of json input') ||
    normalizedMessage.includes('not-started')
  ) {
    return 'Chicken list is unavailable while the shutdown backend is offline.'
  }

  return message
}

export default function ShutdownActionsView({
  address,
  chickens,
  chickensError,
  hasChickenMintAllowance,
  isLoadingChickens,
  mintStates,
  isUnstaking,
  onCopyAddress,
  onMintChicken,
  onUnstake,
  stakedEggs,
  walletEggs,
}: {
  address: `0x${string}`
  chickens: ShutdownChicken[]
  chickensError: string | null
  hasChickenMintAllowance: boolean
  isLoadingChickens: boolean
  mintStates: Record<number, ChickenMintState>
  isUnstaking: boolean
  onCopyAddress: () => void
  onMintChicken: (serialId: number) => void
  onUnstake: () => void
  stakedEggs: bigint | undefined
  walletEggs: bigint | undefined
}) {
  const hasStake = !!stakedEggs && stakedEggs > 0n
  const nonNftChickens = chickens.filter(
    (chicken) => !chicken.onchainOwnerAddress
  )

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
          Owned chickens that are not NFTs yet.
        </p>
        <p className="text-15 text-jet-0.6">
          {hasChickenMintAllowance
            ? 'Mint allowance is ready.'
            : 'Minting may first ask for the contract allowance.'}
        </p>
        {isLoadingChickens && (
          <p className="text-16 text-jet-0.6">Loading chickens...</p>
        )}
        {chickensError && (
          <p className="text-15 text-prickly-pink">{chickensError}</p>
        )}
        {!isLoadingChickens &&
          !chickensError &&
          nonNftChickens.length === 0 && (
            <p className="text-16 text-jet-0.6">
              No non-NFT chickens found for this session.
            </p>
          )}
        {nonNftChickens.length > 0 && (
          <div className="max-h-[260px] overflow-y-auto rounded-lg border border-matcha-powder-0.5">
            <div className="grid grid-cols-[70px_1fr_58px_132px] items-center gap-2 border-b border-matcha-powder-0.5 px-2 py-2 text-15 uppercase text-jet-0.6">
              <p>Serial</p>
              <p>Name</p>
              <p>Lvl</p>
              <p className="text-center">Action</p>
            </div>
            {nonNftChickens.map((chicken) => {
              const mintState = mintStates[chicken.serialId]
              const isMinting =
                mintState?.phase === 'approving' ||
                mintState?.phase === 'minting'
              const isMinted = mintState?.phase === 'success'
              const hasError = mintState?.phase === 'error'

              return (
                <div
                  className="grid grid-cols-[70px_1fr_58px_132px] items-center gap-2 border-b border-matcha-powder-0.5 px-2 py-2 last:border-b-0"
                  key={chicken.id}
                >
                  <p className="text-16 text-jet">#{chicken.serialId}</p>
                  <div className="min-w-0">
                    <p className="truncate text-16 text-jet">{chicken.name}</p>
                    {(mintState?.message || hasError) && (
                      <p
                        className={`truncate text-15 ${
                          hasError ? 'text-prickly-pink' : 'text-jet-0.6'
                        }`}
                      >
                        {mintState?.message}
                      </p>
                    )}
                  </div>
                  <p className="text-16 text-jet">{chicken.level}</p>
                  <ActionButton
                    disabled={isMinting || isMinted}
                    flex
                    backgroundColor="bg-bright-greek-0.5"
                    textColor={
                      !isMinting && !isMinted ? 'text-bright-greek' : undefined
                    }
                    onClick={() => {
                      onMintChicken(chicken.serialId)
                    }}
                    style={{
                      fontSize: 14,
                      padding: '8px 8px 6px 8px',
                    }}
                  >
                    <p>
                      {getChickenMintActionLabel({
                        hasChickenMintAllowance,
                        mintState,
                      })}
                    </p>
                  </ActionButton>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
