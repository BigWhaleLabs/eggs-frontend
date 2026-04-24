import { graphql } from 'helpers/graphql'

export const claimEggsMutation = graphql(`
  mutation claimEggs($ethAddress: String!) {
    claimAllEggs(ethAddress: $ethAddress) {
      message
      signature
      r
      vs
      amount
    }
  }
`)

export const getMyData = graphql(`
  query getMyData {
    getMe {
      serialId
      id
      avatar
      totalDailyYield
      totalHoldings
      unclaimedEggs
      totalJackpotTicketsClaimed
      shouldDisplayJackpotPreviewData
      tipsLeftForLikes
      tipsLeftForComments
      tipsLeftForFollows
      hens {
        id
        serialId
        name
        dailyYield
        level
        onchainOwnerAddress
      }
      didClaimCurrentJackpot
      isAirdropUser
      getJackpotTicketsCount
      claimStreak {
        claimedToday
        claimNumber
      }
      getJackpotTickets {
        type
        amount
      }
    }
  }
`)

export const getMyCocks = graphql(`
  query getMyCocks {
    getMyCockCode {
      id
      code
      usesLeft
    }
  }
`)

export const getMyUnclaimedCoupons = graphql(`
  query getMyUnclaimedCoupons {
    getMyUnclaimedCoupons {
      id
      r
      vs
      amount
      message
    }
  }
`)

export const hatchFreeHenMutation = graphql(`
  mutation hatchFreeHen($cockCode: String!) {
    hatchFreeHen(cockCode: $cockCode) {
      id
    }
  }
`)

export const fertilizeTargetUserMutation = graphql(`
  mutation fertilizeTargetUser($targetUserId: String!) {
    fertilizeUserHen(targetUserId: $targetUserId) {
      id
    }
  }
`)

export const generateUpgradeMutation = graphql(`
  mutation generateChickenLevelUpgrade($henSerialId: Float!) {
    generateChickenLevelUpgrade(henSerialId: $henSerialId) {
      id
      fromLevel
      toLevel
      succeeded
      encodedData
      r
      vs
    }
  }
`)

export const getEmissionData = graphql(`
  query getEmissionData {
    getEmissionData {
      factor
      emission
    }
  }
`)

export const claimJackpotTicketsMutation = graphql(`
  mutation claimJackpotTickets($ethAddress: String!) {
    claimJackpotTickets(ethAddress: $ethAddress) {
      id
      serialId
      amount
      message
      r
      vs
    }
  }
`)

export const getUnclaimedJackpotsCoupon = graphql(`
  query getUnclaimedJackpotCoupon {
    unclaimedJackpotCoupons {
      id
      r
      vs
      amount
      message
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

export const claimChickenOwnershipMutation = graphql(`
  mutation claimChickenOwnership($henSerialId: Float!) {
    claimChickenOwnership(henSerialId: $henSerialId) {
      id
      serialId
      name
      level
      dailyYield
    }
  }
`)

export const getMyOnchainChickens = graphql(`
  query getMyOnchainChickens {
    getOnchainOwnedHens {
      id
      serialId
      name
      level
      dailyYield
      onchainOwnerAddress
      user {
        neynarUserScore
        isVerifiedBot
      }
    }
  }
`)

export const getLeaderboard = graphql(`
  query getLeaderboard {
    getLeaderboard {
      username
      totalHoldings
      fid
    }
  }
`)

export const getMyProxiesQuery = graphql(`
  query getMyProxies {
    getMyProxies {
      id
      address
      createdAt
      updatedAt
    }
  }
`)

export const addProxyMutation = graphql(`
  mutation addProxy($address: String!) {
    addProxy(address: $address) {
      success
      message
      proxy {
        id
        address
        createdAt
        updatedAt
      }
    }
  }
`)

export const removeProxyMutation = graphql(`
  mutation removeProxy($address: String!) {
    removeProxy(address: $address) {
      success
      message
    }
  }
`)

// TODO: Add the correct mutation name when backend is implemented
// export const transferChickenToCoopMutation = graphql(`
//   mutation transferChickenToCoop($henSerialId: Float!) {
//     [MUTATION_NAME](henSerialId: $henSerialId) {
//       id
//       success
//     }
//   }
// `)
