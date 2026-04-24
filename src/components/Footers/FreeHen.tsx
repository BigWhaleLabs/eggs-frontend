import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { cockCodeAtom } from 'atoms/eggochiAtom'
import { ActionButton } from 'components/Buttons'
import RoosterCodeInput from 'components/RoosterCodeInput'
import useShare from 'hooks/useShare'
import useURQLClient from 'hooks/useURQLClient'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { getMyData, hatchFreeHenMutation } from 'queries/eggsQueries'
import toast from 'react-hot-toast'
import { useMutation } from 'urql'

export default function FooterFreeHen() {
  const navigate = useNavigate()
  const { askForCock } = useShare()
  const [cockCode, setCockCode] = useAtom(cockCodeAtom)
  const [error, setError] = useState('')
  const [, hatchFreeHen] = useMutation(hatchFreeHenMutation)

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

  useEffect(() => {
    setError('')
  }, [cockCode])

  const isAirdropUser = data?.data?.getMe.isAirdropUser

  return (
    <>
      <p className="text-28 uppercase text-jet">
        Hatch your <span className="text-bright-greek">free</span> hen
      </p>
      <p className="text-jet-0.6 text-19">
        {isAirdropUser
          ? "You're an eligible airdrop user! You don't need a cock code."
          : "You need someone's rooster code to hatch your egg."}
      </p>
      {!isAirdropUser && (
        <RoosterCodeInput
          error={error}
          roosterCode={cockCode}
          setRoosterCode={setCockCode}
        />
      )}
      <ActionButton
        disabled={(!cockCode.length || cockCode.length < 7) && !isAirdropUser}
        backgroundColor={'bg-bright-greek'}
        flex
        onClick={async () => {
          const result = await hatchFreeHen({
            cockCode,
          })
          if (result.error) {
            setError(result.error.message)
            toast.error(result.error.message)
          } else {
            await navigate({
              to: '/hatching',
            })
            await refetch()
          }
        }}
      >
        <p>HATCH NOW!</p>
      </ActionButton>
      {!isAirdropUser && (
        <ActionButton
          borderColor="border-prickly-pink"
          flex
          onClick={askForCock}
        >
          <p className="text-prickly-pink uppercase">Ask for a cock code!</p>
        </ActionButton>
      )}
    </>
  )
}
