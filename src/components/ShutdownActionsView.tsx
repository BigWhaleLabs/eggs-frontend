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

export function formatShortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
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
  address,
  chicken,
  hasChickenMintBalance,
  mintState,
}: {
  address: `0x${string}` | null
  chicken: ShutdownChicken
  hasChickenMintAllowance: boolean
  hasChickenMintBalance: boolean
  mintState?: ChickenMintState
}) {
  if (mintState?.phase === 'approving') return 'APPROVING'
  if (mintState?.phase === 'minting') return 'MINTING'
  if (mintState?.phase === 'success') return 'MINTED'
  if (
    address &&
    chicken.onchainOwnerAddress?.toLowerCase() === address.toLowerCase()
  ) {
    return 'MINTED'
  }
  if (chicken.onchainOwnerAddress) {
    return `Owned by ${formatShortAddress(chicken.onchainOwnerAddress)}`
  }
  if (!address) return 'Connect wallet'
  if (!hasChickenMintBalance) return 'Need $EGGS'
  return 'MINT'
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
    return 'No offchain chickens available to mint in this browser.'
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
  hasChickenMintBalance,
  hasRequestedChickens,
  isSigningChickens,
  isLoadingChickens,
  mintStates,
  isUnstaking,
  onCopyAddress,
  onLoadChickens,
  onMintChicken,
  onUnstake,
  stakedEggs,
  walletEggs,
}: {
  address: `0x${string}` | null
  chickens: ShutdownChicken[]
  chickensError: string | null
  hasChickenMintAllowance: boolean
  hasChickenMintBalance: boolean
  hasRequestedChickens: boolean
  isSigningChickens: boolean
  isLoadingChickens: boolean
  mintStates: Record<number, ChickenMintState>
  isUnstaking: boolean
  onCopyAddress: () => void
  onLoadChickens: () => void
  onMintChicken: (serialId: number) => void
  onUnstake: () => void
  stakedEggs: bigint | undefined
  walletEggs: bigint | undefined
}) {
  const hasStake = !!stakedEggs && stakedEggs > 0n
  const hasWalletAddress = !!address

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
        disabled={!hasWalletAddress}
      >
        {address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : 'Farcaster'}
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
          Chickens attached to this wallet's Eggs account.
        </p>
        <p className="text-15 text-jet-0.6">
          Minting costs 4,000 $EGGS per chicken and may first ask for contract
          allowance.
        </p>
        <ActionButton
          disabled={isSigningChickens || isLoadingChickens}
          flex
          backgroundColor="bg-bright-greek-0.5"
          textColor={
            !isSigningChickens && !isLoadingChickens
              ? 'text-bright-greek'
              : undefined
          }
          onClick={onLoadChickens}
          style={{
            fontSize: 18,
            padding: '10px 12px 8px 12px',
          }}
        >
          <p className="whitespace-normal break-words leading-tight">
            {isSigningChickens
              ? 'AUTHORIZING...'
              : isLoadingChickens
                ? 'LOADING HENS...'
                : 'SEE MY HENS'}
          </p>
        </ActionButton>
        {isLoadingChickens && (
          <p className="text-16 text-jet-0.6">Loading chickens...</p>
        )}
        {chickensError && (
          <p className="text-15 text-prickly-pink">{chickensError}</p>
        )}
        {!isLoadingChickens &&
          !chickensError &&
          hasRequestedChickens &&
          chickens.length === 0 && (
            <p className="text-16 text-jet-0.6">
              No chickens found for this wallet.
            </p>
          )}
        {chickens.length > 0 && (
          <div className="max-h-[260px] overflow-y-auto rounded-lg border border-matcha-powder-0.5">
            <div className="grid grid-cols-[minmax(0,1fr)_36px_minmax(92px,104px)] items-center gap-2 border-b border-matcha-powder-0.5 px-2 py-2 text-14 uppercase text-jet-0.6">
              <p>Chicken</p>
              <p>Lvl</p>
              <p className="text-center">Mint</p>
            </div>
            {chickens.map((chicken) => {
              const mintState = mintStates[chicken.serialId]
              const onchainOwnerAddress = chicken.onchainOwnerAddress
              const isMinting =
                mintState?.phase === 'approving' ||
                mintState?.phase === 'minting'
              const isMinted =
                mintState?.phase === 'success' ||
                (!!address &&
                  onchainOwnerAddress?.toLowerCase() === address.toLowerCase())
              const isOwnedByAnotherWallet = !!onchainOwnerAddress && !isMinted
              const hasError = mintState?.phase === 'error'
              const isMintDisabled =
                isMinting ||
                isMinted ||
                isOwnedByAnotherWallet ||
                !hasWalletAddress ||
                !hasChickenMintBalance

              return (
                <div
                  className="grid grid-cols-[minmax(0,1fr)_36px_minmax(92px,104px)] items-center gap-2 border-b border-matcha-powder-0.5 px-2 py-2 last:border-b-0"
                  key={chicken.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-16 text-jet">
                      #{chicken.serialId}
                    </p>
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
                    disabled={isMintDisabled}
                    flex
                    backgroundColor="bg-bright-greek-0.5"
                    textColor={
                      !isMintDisabled ? 'text-bright-greek' : undefined
                    }
                    onClick={() => {
                      onMintChicken(chicken.serialId)
                    }}
                    style={{
                      fontSize: 14,
                      minHeight: 38,
                      padding: '7px 6px 5px 6px',
                    }}
                  >
                    <p className="whitespace-normal break-words text-center leading-tight">
                      {getChickenMintActionLabel({
                        address,
                        chicken,
                        hasChickenMintAllowance,
                        hasChickenMintBalance,
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
