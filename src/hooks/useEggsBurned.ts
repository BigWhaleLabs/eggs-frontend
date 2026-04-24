import { graphql } from 'helpers/graphql'
import { useQuery } from 'urql'

const getBurnedEggs = graphql(`
  query getBurnedEggs {
    getBurnedEggsAmount
  }
`)

export default function useEggsBurned() {
  const [eggsBurned] = useQuery({
    query: getBurnedEggs,
  })

  console.log('useEggsBurned', eggsBurned)

  console.log('burned eggs amount', eggsBurned.data?.getBurnedEggsAmount)

  return eggsBurned.data?.getBurnedEggsAmount ?? 0
}
