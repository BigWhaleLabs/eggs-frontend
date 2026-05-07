import { graphql } from 'helpers/graphql'

export const getMyShutdownHensQuery = graphql(`
  query getMyShutdownHens {
    getMyShutdownHens {
      id
      serialId
      name
      level
      onchainOwnerAddress
    }
  }
`)

export const getHenMintSignatureMutation = graphql(`
  mutation getHenMintSignature($henSerialId: Float!, $toAddress: String!) {
    getHenMintSignature(henSerialId: $henSerialId, toAddress: $toAddress) {
      message
      r
      signature
      vs
    }
  }
`)
