import frameSdk from '@farcaster/frame-sdk'
import { useQuery } from '@tanstack/react-query'
import useURQLClient from 'hooks/useURQLClient'
import { useCallback } from 'preact/hooks'
import { getMyCocks } from 'queries/eggsQueries'
import toast from 'react-hot-toast'

async function share(
  text: string,
  url: string,
  verificationType: 'FARCASTER' | 'TWITTER' = 'FARCASTER'
) {
  if (!verificationType) {
    void navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
    return
  }

  const encodedText = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(url)

  if (verificationType === 'FARCASTER') {
    const warpcastUrl = `https://farcaster.xyz/~/compose?text=${encodedText}&embeds[]=${encodedUrl}`
    try {
      const context = await frameSdk.context
      if (context.user.fid) {
        await frameSdk.actions.openUrl(warpcastUrl)
      } else {
        window.open(warpcastUrl, '_blank')
      }
    } catch {
      window.open(warpcastUrl, '_blank')
    }
  } else {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      '_blank'
    )
  }
}

export default function useShare() {
  const client = useURQLClient()
  const fetchCocks = useCallback(
    () => client.query(getMyCocks, {}).toPromise(),
    [client]
  )
  const { data } = useQuery({
    queryKey: ['cocks'],
    queryFn: fetchCocks,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 10,
  })
  const code = data?.data?.getMyCockCode?.code

  const copyText = (text: string, toastText = 'Copied to clipboard!') => {
    void navigator.clipboard.writeText(text)
    toast.success(toastText)
  }

  return {
    copyText,

    copyCockCode() {
      if (!code) {
        toast.error(
          'Code not found! Please try to refresh the page or contact us'
        )
        return
      }
      return copyText(code.toString(), 'Code copied to clipboard!')
    },

    shareCockInvite() {
      if (!code) {
        toast.error(
          'Code not found! Please try to refresh the page or contact us'
        )
        return
      }
      const cockLink = 'https://eggs.name/'
      const text = `My cock is ready to grow your hen house\n\nHatch your hen now with my cock code and earn some $EGGS\n\n${cockLink}`
      return share(text, cockLink, 'FARCASTER')
    },

    shareEggsApp() {
      const text = 'Ready for some COCK and $EGGS action?'
      const url = 'https://eggs.name'
      return share(text, url, 'FARCASTER')
    },

    shareHen(henId: string) {
      if (!code) {
        toast.error(
          'Code not found! Please try to refresh the page or contact us'
        )
        return
      }

      const shareLink = `https://eggs.name/rate-my-cock/${henId}/${code}`
      const cockLink = 'https://eggs.name/'

      const text = `Meet my hen! Ain’t she a beaut 🐓\n\nHatch yours now and earn some $EGGS ${cockLink}`
      return share(text, shareLink, 'FARCASTER')
    },

    askForCock() {
      const text = 'Looking for a cock code to grow my hen house'
      const cockLink = 'https://eggs.name/'
      return share(text, cockLink, 'FARCASTER')
    },

    shareContent(
      text: string,
      url: string,
      verificationType: 'FARCASTER' | 'TWITTER' = 'FARCASTER'
    ) {
      return share(text, url, verificationType)
    },
  }
}
