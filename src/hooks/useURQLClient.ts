import initURQLClient from 'helpers/urqlClient'
import { useMemo } from 'react'

export default function () {
  const client = useMemo(() => initURQLClient(), [])

  return client
}
