import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  formatEggAmount,
  getChickenMintActionLabel,
  getShutdownChickensErrorMessage,
  parseChickenSerialId,
  ShutdownChicken,
} from './ShutdownActionsView'
import ShutdownActionsView from './ShutdownActionsView'

const address = '0x1234567890abcdef1234567890abcdef12345678' as const
const chickens: ShutdownChicken[] = [
  {
    id: 'hen-1',
    level: 2,
    name: 'Alpha',
    onchainOwnerAddress: null,
    serialId: 12,
  },
  {
    id: 'hen-2',
    level: 4,
    name: 'Minted',
    onchainOwnerAddress: address,
    serialId: 13,
  },
]

afterEach(() => {
  cleanup()
})

describe('shutdown actions', () => {
  it('formats wallet and staked egg balances', () => {
    expect(formatEggAmount(1234567890000000000000n)).toBe('1,234.5679')
    expect(formatEggAmount()).toBe('0')
  })

  it('validates chicken serial IDs', () => {
    expect(parseChickenSerialId('42')).toBe(42)
    expect(parseChickenSerialId('0')).toBeNull()
    expect(parseChickenSerialId('4.2')).toBeNull()
    expect(parseChickenSerialId('abc')).toBeNull()
  })

  it('maps shutdown chicken loading errors to reviewable messages', () => {
    expect(
      getShutdownChickensErrorMessage({
        message: '[Network] Failed to fetch',
      })
    ).toBe('Chicken list is unavailable while the shutdown backend is offline.')
    expect(
      getShutdownChickensErrorMessage({
        message: 'Access denied',
      })
    ).toBe('No offchain chickens available to mint in this browser.')
    expect(
      getShutdownChickensErrorMessage({
        message: 'Unexpected backend response',
      })
    ).toBe('Unexpected backend response')
  })

  it('shows disabled shutdown actions when wallet state has no stake or eligible chickens', () => {
    render(
      <ShutdownActionsView
        address={address}
        chickens={[]}
        chickensError={null}
        hasChickenMintAllowance={false}
        hasChickenMintBalance={false}
        isLoadingChickens={false}
        mintStates={{}}
        isUnstaking={false}
        onCopyAddress={() => {}}
        onMintChicken={() => {}}
        onUnstake={() => {}}
        stakedEggs={0n}
        walletEggs={100n}
      />
    )

    expect(screen.getByText('STAKED')).toBeTruthy()
    expect(
      (
        screen.getByRole('button', {
          name: /unstake all/i,
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true)
    expect(screen.getByText(/no offchain chickens available/i)).toBeTruthy()
  })

  it('shows owned non-NFT chickens and sends the selected serial ID to mint', () => {
    const onUnstake = vi.fn()
    const onMintChicken = vi.fn()

    render(
      <ShutdownActionsView
        address={address}
        chickens={chickens}
        chickensError={null}
        hasChickenMintAllowance
        hasChickenMintBalance
        isLoadingChickens={false}
        mintStates={{}}
        isUnstaking={false}
        onCopyAddress={() => {}}
        onMintChicken={onMintChicken}
        onUnstake={onUnstake}
        stakedEggs={10n * 10n ** 18n}
        walletEggs={5000n * 10n ** 18n}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /unstake all/i }))
    fireEvent.click(screen.getByRole('button', { name: /^mint$/i }))

    expect(onUnstake).toHaveBeenCalledTimes(1)
    expect(onMintChicken).toHaveBeenCalledWith(12)
    expect(screen.getByText('#12')).toBeTruthy()
    expect(screen.queryByText('#13')).toBeNull()
  })

  it('keeps row-local chicken mint state visible', () => {
    render(
      <ShutdownActionsView
        address={address}
        chickens={chickens}
        chickensError={null}
        hasChickenMintAllowance={false}
        hasChickenMintBalance
        isLoadingChickens={false}
        mintStates={{
          12: {
            message: 'Waiting for signature...',
            phase: 'minting',
          },
        }}
        isUnstaking={false}
        onCopyAddress={() => {}}
        onMintChicken={() => {}}
        onUnstake={() => {}}
        stakedEggs={10n * 10n ** 18n}
        walletEggs={5000n * 10n ** 18n}
      />
    )

    expect(screen.getByText('Waiting for signature...')).toBeTruthy()
    expect(
      (screen.getByRole('button', { name: /minting/i }) as HTMLButtonElement)
        .disabled
    ).toBe(true)
    expect(
      getChickenMintActionLabel({
        hasChickenMintAllowance: false,
      })
    ).toBe('MINT')
  })
})
