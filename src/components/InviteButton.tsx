import { useQuery } from '@tanstack/react-query'
import zalgo from 'helpers/zalgo'
import { ModalState, useModal } from 'hooks/useModal'
import useURQLClient from 'hooks/useURQLClient'
import InviteButtonShape from 'icons/InviteButtonShape'
import { useCallback } from 'preact/hooks'
import { getMyCocks } from 'queries/eggsQueries'

export default function InviteButton() {
  const { openModal } = useModal()

  const client = useURQLClient()
  const fetchCocks = useCallback(
    () => client.query(getMyCocks, {}).toPromise(),
    [client]
  )
  const { data } = useQuery({
    queryKey: ['cocks'],
    queryFn: fetchCocks,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

  const usesLeft = data?.data?.getMyCockCode?.usesLeft

  console.log('data', data?.data?.getMyCockCode)

  return (
    <button
      onClick={() => {
        openModal(ModalState.ShareYourCock)
      }}
      className="cursor-pointer flex flex-col items-center"
      style={{
        lineHeight: 'normal',
      }}
    >
      <InviteButtonShape />
      <p className="-mt-9.5 mr-2.5 text-2xl">🐔</p>

      <p className="text-[#FFE500] text-19 mt-1">{zalgo('INVITE')}</p>
      <p className="text-19 text-[#FFE500]">({usesLeft}/3)</p>
    </button>
  )
}
