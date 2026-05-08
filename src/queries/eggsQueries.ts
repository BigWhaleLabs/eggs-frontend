import { graphql } from 'helpers/graphql'

export const getMyShutdownHensQuery = graphql(`
  query getMyShutdownHens($authSignature: String, $ownerAddress: String) {
    getMyShutdownHens(
      authSignature: $authSignature
      ownerAddress: $ownerAddress
    ) {
      id
      serialId
      name
      level
      onchainOwnerAddress
    }
  }
`)

export const getHenMintSignatureMutation = graphql(`
  mutation getHenMintSignature(
    $authSignature: String
    $henSerialId: Float!
    $toAddress: String!
  ) {
    getHenMintSignature(
      authSignature: $authSignature
      henSerialId: $henSerialId
      toAddress: $toAddress
    ) {
      message
      r
      signature
      vs
    }
  }
`)
