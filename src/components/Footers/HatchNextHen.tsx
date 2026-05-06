import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ActionButton } from 'components/Buttons'
import eggsContractAbi from 'helpers/eggsContractAbi'
import useConnectFarcaster from 'hooks/useConnectFarcaster'
import useURQLClient from 'hooks/useURQLClient'
import { useCallback } from 'preact/hooks'
import { getMyData } from 'queries/eggsQueries'
import toast from 'react-hot-toast'
import { formatUnits, zeroAddress } from 'viem'
import { base } from 'viem/chains'
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
} from 'wagmi'

export default function HatchNextHen({ henNumber }: { henNumber: number }) {
  const navigate = useNavigate()
  const client = useURQLClient()
  const fetchHens = useCallback(
    () => client.query(getMyData, {}).toPromise(),
    [client]
  )
  const { refetch, data } = useQuery({
    queryKey: ['myData'],
    queryFn: fetchHens,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })
  const { writeContractAsync } = useWriteContract()
  const price = 100

  const account = useAccount()
  const connectFarcaster = useConnectFarcaster()

  const { data: eggsBalanceData, refetch: refetchBalance } = useReadContract({
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

  return (
    <>
      <p className="text-28 uppercase text-jet">
        Hatch hen {henNumber} for {price} $EGGS
      </p>
      <p className="text-jet-0.6 text-19">More hens equals more $EGGS!</p>
      <ActionButton
        backgroundColor={'bg-bright-greek'}
        flex
        onClick={async () => {
          await connectFarcaster()

          await refetch()
          await refetchBalance()

          if (!data || !data.data?.getMe.serialId) {
            toast.error('Data not found. Please try to refresh the page.')
            return
          }

          if (!ethBalanceData || ethBalanceData.value <= 0n) {
            toast.error('You need some ETH in your wallet to pay for gas')
            return
          }

          if (!eggsBalanceData) {
            toast.error("You don't have any $EGGS. Buy some first!")
            return
          }

          if (parseFloat(formatUnits(eggsBalanceData, 18)) < BigInt(price)) {
            toast.error('Not enough $EGGS to hatch this hen!')
            return
          }

          await writeContractAsync({
            abi: eggsContractAbi,
            chainId: base.id,
            functionName: 'buyExtraChicken',
            args: [BigInt(data.data.getMe.serialId)],
            address: '0x712f43B21cf3e1B189c27678C0f551c08c01D150',
          })

          await navigate({
            to: '/',
          })

          await refetch()
          await refetchBalance()
        }}
      >
        <p>
          {!account.address || !account.isConnected
            ? 'CONNECT WALLET'
            : 'HATCH NOW!'}
        </p>
      </ActionButton>
    </>
  )
}
