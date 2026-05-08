import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  formatShortAddress,
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
  {
    id: 'hen-3',
    level: 5,
    name: 'Other',
    onchainOwnerAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    serialId: 14,
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

  it('formats short addresses', () => {
    expect(formatShortAddress(address)).toBe('0x1234...5678')
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
        hasRequestedChickens
        isSigningChickens={false}
        isLoadingChickens={false}
        mintStates={{}}
        isUnstaking={false}
        onCopyAddress={() => {}}
        onLoadChickens={() => {}}
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
    expect(screen.getByText(/no chickens found/i)).toBeTruthy()
  })

  it('loads chickens only from the explicit button', () => {
    const onLoadChickens = vi.fn()

    render(
      <ShutdownActionsView
        address={address}
        chickens={[]}
        chickensError={null}
        hasChickenMintAllowance={false}
        hasChickenMintBalance={false}
        hasRequestedChickens={false}
        isSigningChickens={false}
        isLoadingChickens={false}
        mintStates={{}}
        isUnstaking={false}
        onCopyAddress={() => {}}
        onLoadChickens={onLoadChickens}
        onMintChicken={() => {}}
        onUnstake={() => {}}
        stakedEggs={0n}
        walletEggs={0n}
      />
    )

    expect(screen.queryByText(/no chickens found/i)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /see my hens/i }))
    expect(onLoadChickens).toHaveBeenCalledTimes(1)
  })

  it('shows chickens and sends an eligible selected serial ID to mint', () => {
    const onUnstake = vi.fn()
    const onMintChicken = vi.fn()

    render(
      <ShutdownActionsView
        address={address}
        chickens={chickens}
        chickensError={null}
        hasChickenMintAllowance
        hasChickenMintBalance
        hasRequestedChickens
        isSigningChickens={false}
        isLoadingChickens={false}
        mintStates={{}}
        isUnstaking={false}
        onCopyAddress={() => {}}
        onLoadChickens={() => {}}
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
    expect(screen.getByText('#13')).toBeTruthy()
    expect(screen.getByText('#14')).toBeTruthy()
    expect(screen.getByRole('button', { name: /^minted$/i })).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /owned by 0xabcd...abcd/i })
    ).toBeTruthy()
  })

  it('keeps row-local chicken mint state visible', () => {
    render(
      <ShutdownActionsView
        address={address}
        chickens={chickens}
        chickensError={null}
        hasChickenMintAllowance={false}
        hasChickenMintBalance
        hasRequestedChickens
        isSigningChickens={false}
        isLoadingChickens={false}
        mintStates={{
          12: {
            message: 'Waiting for signature...',
            phase: 'minting',
          },
        }}
        isUnstaking={false}
        onCopyAddress={() => {}}
        onLoadChickens={() => {}}
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
        address,
        chicken: chickens[0],
        hasChickenMintAllowance: false,
        hasChickenMintBalance: true,
      })
    ).toBe('MINT')
    expect(
      getChickenMintActionLabel({
        address,
        chicken: chickens[0],
        hasChickenMintAllowance: false,
        hasChickenMintBalance: false,
      })
    ).toBe('Need $EGGS')
    expect(
      getChickenMintActionLabel({
        address,
        chicken: chickens[1],
        hasChickenMintAllowance: true,
        hasChickenMintBalance: true,
      })
    ).toBe('MINTED')
    expect(
      getChickenMintActionLabel({
        address,
        chicken: chickens[2],
        hasChickenMintAllowance: true,
        hasChickenMintBalance: true,
      })
    ).toBe('Owned by 0xabcd...abcd')
  })
})
