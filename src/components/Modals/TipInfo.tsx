import { useQuery } from '@tanstack/react-query'
import { ActionButton } from 'components/Buttons'
import { ModalState, useModal } from 'hooks/useModal'
import useURQLClient from 'hooks/useURQLClient'
import { useCallback } from 'preact/hooks'
import { getMyData } from 'queries/eggsQueries'

export default function TipInfo() {
  const { closeModal, openModal } = useModal()

  const client = useURQLClient()
  const fetchUserData = useCallback(
    () => client.query(getMyData, {}).toPromise(),
    [client]
  )

  const { data, isFetched } = useQuery({
    queryKey: ['myData'],
    queryFn: fetchUserData,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

  const tipsLeftForLikes = data?.data?.getMe.tipsLeftForLikes
  const tipsLeftForComments = data?.data?.getMe.tipsLeftForComments
  const tipsLeftForFollows = data?.data?.getMe.tipsLeftForFollows
  const totalTips =
    (tipsLeftForLikes || 0) +
    (tipsLeftForComments || 0) +
    (tipsLeftForFollows || 0)

  const isDataAvailable =
    tipsLeftForLikes !== undefined &&
    tipsLeftForComments !== undefined &&
    tipsLeftForFollows !== undefined

  // Only show loading on initial fetch, not on refetch
  const showLoading = !isFetched

  return (
    <div
      className="bg-nuclear-blast p-4 pt-6 flex flex-col gap-[9px] text-center rounded-xl"
      style={{
        lineHeight: 'normal',
      }}
    >
      <p className="text-49 text-bright-greek">tip-bok-tip!</p>
      <p
        className="text-2xl text-bright-greek uppercase"
        style={{
          lineHeight: 'normal',
        }}
      >
        TIPPING WITH $EGGS
      </p>
      <p className="text-19 text-jet-0.6">
        25% of daily burned $eggs is distributed proportionally to all users who
        hold at least 15,000 $eggs to tip with on Farcaster.
      </p>
      <p className="text-19 text-jet-0.6">
        If you do not tip, your allocation vanishes. Allocation resets daily.
      </p>
      <div className="h-px w-full bg-matcha-powder-0.5" />
      <div className="flex flex-row justify-between text-19 text-bright-greek">
        <p>Tip type</p>
        <p>Amount available</p>
      </div>
      <div className="flex flex-row justify-between text-black text-19">
        <p>Likes</p>
        <p>
          {showLoading
            ? 'Loading...'
            : isDataAvailable
              ? `${tipsLeftForLikes} $EGGS`
              : '-- $EGGS'}
        </p>
      </div>
      <div className="flex flex-row justify-between text-black text-19">
        <p>Comments</p>
        <p>
          {showLoading
            ? 'Loading...'
            : isDataAvailable
              ? `${tipsLeftForComments} $EGGS`
              : '-- $EGGS'}
        </p>
      </div>
      <div className="flex flex-row justify-between text-black text-19">
        <p>Follows</p>
        <p>
          {showLoading
            ? 'Loading...'
            : isDataAvailable
              ? `${tipsLeftForFollows} $EGGS`
              : '-- $EGGS'}
        </p>
      </div>
      <div className="w-full h-px bg-matcha-powder-0.5" />
      <p className="text-black text-19">
        TOTAL TO TIP:{' '}
        {showLoading
          ? 'Loading...'
          : isDataAvailable
            ? `${totalTips.toLocaleString()} $EGGS`
            : '-- $EGGS'}
      </p>
      <div className="w-full h-px bg-matcha-powder-0.5" />
      <p className="text-19 text-jet-0.6">
        You automatically tip 5 $eggs to whoever's post you like (likes
        allocation), automatically tip 10 $eggs to whoever follows you, and when
        you comment "<span className="text-black">10 $eggs</span>" (comments
        allocation).
      </p>
      <div className="w-full h-px bg-matcha-powder-0.5" />
      <ActionButton
        backgroundColor="bg-bright-greek"
        textColor="text-nuclear-blast"
        onClick={() => openModal(ModalState.Leaderboard)}
      >
        LEADERBOARD
      </ActionButton>
      <ActionButton
        backgroundColor="bg-bright-greek"
        textColor="text-nuclear-blast"
        onClick={closeModal}
      >
        GOT IT
      </ActionButton>
    </div>
  )
}
