import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'preact/hooks'
import { getEmissionData } from 'queries/eggsQueries'
import useURQLClient from './useURQLClient'

export default function useYieldWithFactor() {
  const client = useURQLClient()
  const fetchEmissionData = useCallback(
    () => client.query(getEmissionData, {}).toPromise(),
    [client]
  )
  const { data: emissionData } = useQuery({
    queryKey: ['emissionData'],
    queryFn: fetchEmissionData,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })

  const calculateYield = useCallback(
    (yieldAmount: number) => {
      return (
        yieldAmount * (1 - (emissionData?.data?.getEmissionData.factor || 0))
      )
    },
    [emissionData]
  )

  return {
    calculateYield,
    factor: emissionData?.data?.getEmissionData.factor || 0,
    emission: emissionData?.data?.getEmissionData.emission || 0,
  }
}
