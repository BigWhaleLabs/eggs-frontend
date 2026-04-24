import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect } from 'preact/hooks'
import { fertilizeTargetUserMutation } from 'queries/eggsQueries'
import toast from 'react-hot-toast'
import { useMutation } from 'urql'

export const Route = createFileRoute('/anyone-have-cock/$userId')({
  component: RouteComponent,
  preload: true,
})

function RouteComponent() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()

  const [, fertilizeUserHen] = useMutation(fertilizeTargetUserMutation)

  const fertilizeAndRedirect = useCallback(async () => {
    const reuslt = await fertilizeUserHen({
      targetUserId: userId,
    })
    if (!reuslt.error) {
      toast.success('Your cock just made someone very happy!')
    } else {
      toast.error(reuslt.error.message)
    }

    await navigate({
      to: '/',
    })
  }, [fertilizeUserHen, navigate, userId])

  useEffect(() => {
    fertilizeAndRedirect().catch(console.error)
  }, [fertilizeAndRedirect])

  return <></>
}
