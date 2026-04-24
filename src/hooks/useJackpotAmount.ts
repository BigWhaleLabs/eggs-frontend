import eggsContractAbi from 'helpers/eggsContractAbi'
import ignoredBurnTxs from 'helpers/ignoredBurnTxs'
import { useCallback, useEffect, useState } from 'react'
import { formatUnits, zeroAddress } from 'viem'
import { usePublicClient } from 'wagmi'

export default function useJackpotAmount() {
  const publicClient = usePublicClient()

  const getJackpotAmount = useCallback(async () => {
    const jackpots = await publicClient?.getContractEvents({
      abi: eggsContractAbi,
      address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
      eventName: 'JackpotWinnersSet',
      fromBlock: 27597199n,
    })

    const lastJackpotBlock = jackpots?.[jackpots.length - 1]?.blockNumber

    const burnedSinceLastJackpot = await publicClient?.getContractEvents({
      abi: eggsContractAbi,
      address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
      eventName: 'Transfer',
      fromBlock: lastJackpotBlock,
      args: {
        to: zeroAddress,
      },
    })

    const burnedEggs =
      burnedSinceLastJackpot?.reduce((acc, log) => {
        return (
          acc +
          (ignoredBurnTxs.includes(log.transactionHash)
            ? 0n
            : log.args.value || 0n)
        )
      }, 0n) || 0n

    return Number(formatUnits(burnedEggs, 18)) / 8
  }, [publicClient])

  const [jackpotAmount, setJackpotAmount] = useState<number | null>(null)

  useEffect(() => {
    if (jackpotAmount !== null) return
    getJackpotAmount()
      .then((amount) => {
        setJackpotAmount(amount)
      })
      .catch((error) => {
        console.error('Error fetching jackpot amount:', error)
      })
  }, [getJackpotAmount, jackpotAmount])

  return jackpotAmount
}
