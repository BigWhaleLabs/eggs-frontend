import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { cockCodeAtom } from 'atoms/eggochiAtom'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'preact/hooks'

export const Route = createFileRoute('/use-my-cock/$cockCode')({
  component: RouteComponent,
  preload: true,
})

function RouteComponent() {
  const { cockCode: refCockCode } = Route.useParams()
  const setCockCode = useSetAtom(cockCodeAtom)
  const navigate = useNavigate()

  const setCockAndRedirect = useCallback(async () => {
    setCockCode(refCockCode)
    await navigate({
      to: '/',
    })
  }, [refCockCode, setCockCode, navigate])

  useEffect(() => {
    setCockAndRedirect().catch(console.error)
  }, [navigate, refCockCode, setCockAndRedirect, setCockCode])

  return <></>
}
