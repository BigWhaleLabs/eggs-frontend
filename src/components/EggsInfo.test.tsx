import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ShutdownActionsView, { formatEggAmount } from './ShutdownActionsView'

const address = '0x1234567890abcdef1234567890abcdef12345678' as const

afterEach(() => {
  cleanup()
})

describe('shutdown actions', () => {
  it('formats wallet and staked egg balances', () => {
    expect(formatEggAmount(1234567890000000000000n)).toBe('1,234.5679')
    expect(formatEggAmount()).toBe('0')
  })

  it('shows the permanent Chicken mint halt without mint controls', () => {
    render(
      <ShutdownActionsView
        address={address}
        isUnstaking={false}
        onCopyAddress={() => {}}
        onUnstake={() => {}}
        stakedEggs={0n}
        walletEggs={100n}
      />
    )

    expect(
      screen.getByText(
        'Chicken minting has been halted for good. No new Chicken NFTs can be minted.'
      )
    ).toBeTruthy()
    expect(screen.queryByRole('button', { name: /mint/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /see my hens/i })).toBeNull()
  })

  it('keeps the remaining unstake action', () => {
    const onUnstake = vi.fn()

    render(
      <ShutdownActionsView
        address={address}
        isUnstaking={false}
        onCopyAddress={() => {}}
        onUnstake={onUnstake}
        stakedEggs={10n * 10n ** 18n}
        walletEggs={100n}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /unstake all/i }))
    expect(onUnstake).toHaveBeenCalledTimes(1)
  })
})
