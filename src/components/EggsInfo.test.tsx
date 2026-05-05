import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatEggAmount, parseChickenSerialId } from './ShutdownActionsView'
import ShutdownActionsView from './ShutdownActionsView'

const address = '0x1234567890abcdef1234567890abcdef12345678' as const

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

  it('shows disabled shutdown actions when wallet state has no stake or serial ID', () => {
    render(
      <ShutdownActionsView
        address={address}
        chickenSerialId=""
        hasChickenMintAllowance={false}
        isMintingChicken={false}
        isUnstaking={false}
        onChickenSerialIdChange={() => {}}
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
    expect(
      (
        screen.getByRole('button', {
          name: /turn into nft/i,
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true)
  })

  it('enables unstake and chicken mint actions when wallet state is actionable', () => {
    const onUnstake = vi.fn()
    const onMintChicken = vi.fn()
    const onChickenSerialIdChange = vi.fn()

    render(
      <ShutdownActionsView
        address={address}
        chickenSerialId="12"
        hasChickenMintAllowance
        isMintingChicken={false}
        isUnstaking={false}
        onChickenSerialIdChange={onChickenSerialIdChange}
        onCopyAddress={() => {}}
        onMintChicken={onMintChicken}
        onUnstake={onUnstake}
        stakedEggs={10n * 10n ** 18n}
        walletEggs={5000n * 10n ** 18n}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /unstake all/i }))
    fireEvent.click(screen.getByRole('button', { name: /turn into nft/i }))
    fireEvent.input(screen.getByLabelText(/chicken serial id/i), {
      target: { value: '13' },
    })

    expect(onUnstake).toHaveBeenCalledTimes(1)
    expect(onMintChicken).toHaveBeenCalledTimes(1)
    expect(onChickenSerialIdChange).toHaveBeenCalledWith('13')
  })
})
