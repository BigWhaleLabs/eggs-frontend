import { useNavigate } from '@tanstack/react-router'
import { ActionButton } from 'components/Buttons'
import { levelToChickenInfo } from 'components/Footers/ChickenInfo'
import eggsContractAbi from 'helpers/eggsContractAbi'
import { useModal } from 'hooks/useModal'
import useYieldWithFactor from 'hooks/useYieldFactor'
import { atom, useSetAtom } from 'jotai'
import { generateUpgradeMutation } from 'queries/eggsQueries'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation } from 'urql'
import { formatUnits, zeroAddress } from 'viem'
import { base } from 'viem/chains'
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from 'wagmi'

export const upgradeStatusAtom = atom<boolean>(false)

export default function LevelUpHen() {
  const { closeModal, modalProps } = useModal()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const setUpgradeStatus = useSetAtom(upgradeStatusAtom)
  const { calculateYield } = useYieldWithFactor()

  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const level = modalProps?.level || 0
  const nextLevel = level + 1
  const chickenSerialId = modalProps?.chickenSerialId

  const currentYield = calculateYield(levelToChickenInfo[level].dailyYield)
  const nextYield = calculateYield(levelToChickenInfo[nextLevel].dailyYield)

  const upgradePrice = levelToChickenInfo[nextLevel].price
  const chance = levelToChickenInfo[nextLevel].successRate

  const account = useAccount()

  const { data: eggsBalanceData } = useReadContract({
    address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
    abi: eggsContractAbi,
    functionName: 'balanceOf',
    args: [account.address || zeroAddress],
    chainId: base.id,
    query: {
      refetchInterval: 1000 * 10,
      enabled: !!account.address,
    },
  })

  const { data: ethBalanceData } = useBalance({
    address: account.address || zeroAddress,
    chainId: base.id,
    query: {
      refetchInterval: 1000 * 10,
      enabled: !!account.address,
    },
  })

  const [, generateUpgrade] = useMutation(generateUpgradeMutation)

  const handleLevelUp = useCallback(
    async (e: Event) => {
      e.stopPropagation()

      if (isProcessing) return

      if (!chickenSerialId) {
        toast.error('Missing chicken information')
        closeModal()
        return
      }

      const hasCommitment = await publicClient?.readContract({
        address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
        abi: eggsContractAbi,
        functionName: 'chickenLevelCommitments',
        args: [BigInt(chickenSerialId)],
      })

      if (!eggsBalanceData && !hasCommitment) {
        toast.error("You don't have any $EGGS. Buy some first!")
        closeModal()
        return
      }

      if (!ethBalanceData || ethBalanceData.value <= 0n) {
        toast.error('You need some ETH in your wallet to pay for gas')
        return
      }

      try {
        setIsProcessing(true)

        if (!publicClient) {
          toast.error('Public client not found')
          return
        }

        if (!hasCommitment) {
          if (
            parseFloat(formatUnits(eggsBalanceData as bigint, 18)) <
            BigInt(upgradePrice)
          ) {
            toast.error('Not enough $EGGS to upgrade this hen!')
            return
          }
          toast.loading('Committing to level up...')
          const txHash = await writeContractAsync({
            address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
            abi: eggsContractAbi,
            functionName: 'commitToLevelUpChicken',
            args: [BigInt(chickenSerialId)],
          })

          await publicClient?.waitForTransactionReceipt({
            hash: txHash,
            confirmations: 2,
          })
        } else {
          console.log('Chicken already has a commitment, skipping step 1')
        }

        toast.dismiss()

        toast.loading('Getting level up signature...')

        const result = await generateUpgrade({
          henSerialId: chickenSerialId,
        })

        toast.dismiss()

        console.log('Generate upgrade result:', result)

        if (!result.data?.generateChickenLevelUpgrade) {
          throw new Error('Failed to generate upgrade signature')
        }

        const upgrade = result.data.generateChickenLevelUpgrade

        toast.loading('Confirming level up...')

        console.log('Upgrade:', upgrade)

        const txHash = await writeContractAsync({
          address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
          abi: eggsContractAbi,
          chainId: base.id,
          functionName: 'levelUpChicken',
          args: [
            upgrade.encodedData as `0x${string}`,
            upgrade.r as `0x${string}`,
            upgrade.vs as `0x${string}`,
          ],
        })

        await publicClient?.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 2,
        })

        toast.dismiss()
        toast.success('Level up initiated!')

        setUpgradeStatus(upgrade.succeeded)

        closeModal()

        await navigate({
          to: '/leveling',
        })
      } catch (error) {
        console.error('Error during level up:', error)
        toast.dismiss()
        toast.error(
          'Failed to level up: ' +
            (error instanceof Error ? error.message : 'Unknown error')
        )
      } finally {
        setIsProcessing(false)
      }
    },
    [
      isProcessing,
      chickenSerialId,
      eggsBalanceData,
      closeModal,
      publicClient,
      ethBalanceData,
      generateUpgrade,
      writeContractAsync,
      setUpgradeStatus,
      navigate,
      upgradePrice,
    ]
  )

  return (
    <div
      className="flex flex-col items-center gap-6 relative"
      onClick={closeModal}
    >
      <div
        className="bg-nuclear-blast p-4 pt-6 flex flex-col gap-[9px] text-center rounded-xl"
        style={{
          lineHeight: 'normal',
        }}
      >
        <p className="text-49 text-bright-greek">B-Bok bak!</p>
        <p
          className="text-2xl text-bright-greek uppercase"
          style={{
            lineHeight: 'normal',
          }}
        >
          Level up {modalProps?.chickenName}?
        </p>
        <div className="flex flex-row gap-[9px] justifyce items-center">
          <HenUpgradeBox
            henName={modalProps?.chickenName || ''}
            lvl={level + 1}
            dailyYield={currentYield}
          />
          <p>👉</p>
          <HenUpgradeBox
            upgraded
            henName={modalProps?.chickenName || ''}
            lvl={nextLevel + 1}
            dailyYield={nextYield}
          />
        </div>
        <div className="h-px w-full bg-matcha-powder-0.5" />
        <div className="flex flex-row justify-center text-19 text-bright-greek gap-2">
          <div className="flex flex-col gap-[9px]">
            <p>
              Success
              <br />
              rate
            </p>
            <p className="text-black">{chance}%</p>
          </div>
          <div className="flex flex-col gap-[9px] justify-between">
            <p className="mt-[11px]">Price</p>
            <p className="text-black">{upgradePrice} $EGGS</p>
          </div>
        </div>
        <div className="h-px w-full bg-matcha-powder-0.5" />

        <ActionButton
          onClick={handleLevelUp}
          flex
          backgroundColor="bg-bright-greek"
          disabled={isProcessing}
        >
          {isProcessing
            ? 'PROCESSING...'
            : `YES, LEVEL UP FOR ${upgradePrice.toString()} $EGGS`}
        </ActionButton>
      </div>
      <div className="flex flex-1">
        <ActionButton
          borderColor="border-white"
          textColor="text-white"
          onClick={closeModal}
          disabled={isProcessing}
        >
          CLOSE
        </ActionButton>
      </div>
    </div>
  )
}

function HenUpgradeBox({
  henName,
  upgraded,
  lvl,
  dailyYield,
}: {
  henName: string
  upgraded?: boolean
  lvl: number
  dailyYield: number
}) {
  return (
    <div
      className="flex flex-col p-3 rounded-xl flex-1"
      style={{
        border: `1px solid ${upgraded ? '#2A3FFF' : 'rgba(0, 0, 0, 0.10)'}`,
      }}
    >
      <p
        className="text-2xl"
        style={{
          lineHeight: 'normal',
        }}
      >
        🐔
      </p>
      <p
        className="text-xl text-black"
        style={{
          lineHeight: 'normal',
        }}
      >
        {henName}
      </p>
      <p
        className="text-base text-jet-0.6"
        style={{
          lineHeight: 'normal',
        }}
      >
        lvl {lvl}
      </p>
      <p
        className="text-base text-jet-0.6"
        style={{
          lineHeight: 'normal',
        }}
      >
        {dailyYield.toString()} $EGGS/day
      </p>
    </div>
  )
}
