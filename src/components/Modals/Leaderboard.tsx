import frameSdk from '@farcaster/frame-sdk'
import { useQuery } from '@tanstack/react-query'
import { ActionButton } from 'components/Buttons'
import { useModal } from 'hooks/useModal'
import useURQLClient from 'hooks/useURQLClient'
import { useCallback } from 'preact/hooks'
import { getLeaderboard } from 'queries/eggsQueries'

export default function Leaderboard() {
  const { closeModal } = useModal()

  const client = useURQLClient()
  const fetchLeaderboard = useCallback(
    () => client.query(getLeaderboard, {}).toPromise(),
    [client]
  )

  const { data, isFetched } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
  })

  const leaderboardData = data?.data?.getLeaderboard || []
  const showLoading = !isFetched

  const handleFollow = (fid: string | null) => {
    if (fid) {
      return frameSdk.actions.viewProfile({
        fid: +fid,
      })
    }
  }

  return (
    <div
      className="bg-nuclear-blast p-4 pt-6 flex flex-col gap-[9px] text-center rounded-xl"
      style={{
        lineHeight: 'normal',
      }}
    >
      <p className="text-49 text-bright-greek">Top holders</p>
      <p
        className="text-2xl text-bright-greek uppercase"
        style={{
          lineHeight: 'normal',
        }}
      >
        $EGGS LEADERBOARD
      </p>
      <p className="text-19 text-jet-0.6">
        Follow the top $EGGS holders to get tipped!
      </p>
      <div className="h-px w-full bg-matcha-powder-0.5" />

      {showLoading ? (
        <p className="text-black text-19">Loading leaderboard...</p>
      ) : leaderboardData.length === 0 ? (
        <p className="text-black text-19">No data available</p>
      ) : (
        <div className="flex flex-col max-h-60 overflow-y-auto">
          {leaderboardData.map((user, index) => (
            <div
              key={user.fid || index}
              className="flex flex-row justify-between items-center text-black text-16 px-2 py-2"
            >
              <div className="flex flex-col text-left flex-1">
                <p className="truncate">
                  {`@${user.username}` || `User ${index + 1}`}
                </p>
                <p className="text-14 text-jet-0.8 text-bright-greek">
                  {user.totalHoldings
                    ? Math.floor(user.totalHoldings) >= 1000
                      ? `${Math.floor(Math.floor(user.totalHoldings) / 1000)}k`
                      : Math.floor(user.totalHoldings).toLocaleString()
                    : '0'}{' '}
                  $EGGS
                </p>
              </div>
              <div className="ml-2">
                <ActionButton
                  backgroundColor="bg-bright-greek"
                  textColor="text-nuclear-blast"
                  onClick={() => handleFollow(user.fid)}
                  disabled={!user.fid}
                >
                  FOLLOW
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="w-full h-px bg-matcha-powder-0.5" />
      <ActionButton
        backgroundColor="bg-bright-greek"
        textColor="text-nuclear-blast"
        onClick={closeModal}
      >
        CLOSE
      </ActionButton>
    </div>
  )
}
