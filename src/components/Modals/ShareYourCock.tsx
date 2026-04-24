import { useQuery } from '@tanstack/react-query'
import { ActionButton } from 'components/Buttons'
import { useModal } from 'hooks/useModal'
import useShare from 'hooks/useShare'
import useURQLClient from 'hooks/useURQLClient'
import { useCallback } from 'preact/hooks'
import { getMyCocks } from 'queries/eggsQueries'

export default function ShareYourCock() {
  const { closeModal } = useModal()
  const { shareCockInvite, copyCockCode } = useShare()

  const client = useURQLClient()
  const fetchHens = useCallback(
    () => client.query(getMyCocks, {}).toPromise(),
    [client]
  )
  const { data } = useQuery({
    queryKey: ['cocks'],
    queryFn: fetchHens,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

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
        <p className="text-49 text-bright-greek">Bok bak!</p>
        <p
          className="text-2xl text-bright-greek uppercase"
          style={{
            lineHeight: 'normal',
          }}
        >
          share your cock to invite frens!
        </p>
        <ul className="list-disc pl-3 text-19 text-start text-jet-0.6">
          <li>
            Noobs need a rooster (cock code) to fertilize their first egg.
          </li>
          <li>Your 3 cocks refresh daily</li>
          <li>Each time someone uses your cock, you will earn 5 $EGGS!</li>
        </ul>
        <ActionButton
          onClick={shareCockInvite}
          flex
          backgroundColor="bg-bright-greek"
        >
          SHARE INVITE
        </ActionButton>
        <ActionButton
          onClick={copyCockCode}
          flex
          backgroundColor="bg-bright-greek"
        >
          COPY MY COCK CODE
        </ActionButton>
        <div className="h-px w-full bg-matcha-powder-0.5" />
        <div className="flex flex-row  justify-center">
          <p
            className="text-2xl"
            style={{
              lineHeight: 'normal',
            }}
          >
            {new Array(data?.data?.getMyCockCode?.usesLeft || 0)
              .fill(0)
              .map(() => {
                return <>🐔</>
              })}
          </p>
        </div>
        <p
          className="text-jet-0.6 text-base"
          style={{
            lineHeight: 'normal',
          }}
        >
          {data?.data?.getMyCockCode?.usesLeft} cocks remaining
        </p>
      </div>
      <div className="flex flex-1">
        <ActionButton
          borderColor="border-white"
          textColor="text-white"
          onClick={closeModal}
        >
          CLOSE
        </ActionButton>
      </div>
    </div>
  )
}
