import { graphql } from 'helpers/graphql'

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
