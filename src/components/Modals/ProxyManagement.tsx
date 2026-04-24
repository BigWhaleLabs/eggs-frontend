import frameSdk from '@farcaster/frame-sdk'
import { useQuery } from '@tanstack/react-query'
import { ActionButton } from 'components/Buttons'
import { useModal } from 'hooks/useModal'
import useURQLClient from 'hooks/useURQLClient'
import { useCallback, useMemo, useState } from 'preact/hooks'
import {
  addProxyMutation,
  getMyProxiesQuery,
  removeProxyMutation,
} from 'queries/eggsQueries'
import toast from 'react-hot-toast'
import { isAddress } from 'viem'

export default function ProxyManagement() {
  const { closeModal } = useModal()
  const [newProxyAddress, setNewProxyAddress] = useState('')
  const [isAddingProxy, setIsAddingProxy] = useState(false)
  const [isRemovingProxy, setIsRemovingProxy] = useState(false)
  const [removingAddress, setRemovingAddress] = useState('')

  const client = useURQLClient()

  const fetchProxies = useCallback(
    () => client.query(getMyProxiesQuery, {}).toPromise(),
    [client]
  )

  const {
    data: proxiesData,
    refetch: refetchProxies,
    isFetched,
  } = useQuery({
    queryKey: ['myProxies'],
    queryFn: fetchProxies,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  const showLoading = !isFetched

  const proxies = useMemo(
    () => proxiesData?.data?.getMyProxies || [],
    [proxiesData]
  )

  const handleAddProxy = useCallback(async () => {
    if (!newProxyAddress || !isAddress(newProxyAddress)) {
      toast.error('Please enter a valid Ethereum address.')
      return
    }

    if (
      proxies.some(
        (proxy) => proxy.address.toLowerCase() === newProxyAddress.toLowerCase()
      )
    ) {
      toast.error('This address is already a proxy.')
      return
    }

    try {
      setIsAddingProxy(true)
      toast.loading('Adding proxy...')

      const result = await client
        .mutation(addProxyMutation, {
          address: newProxyAddress,
        })
        .toPromise()

      if (result.data?.addProxy.success) {
        toast.success(
          result.data.addProxy.message || 'Proxy added successfully!'
        )
        setNewProxyAddress('')
        void refetchProxies()
      } else {
        toast.error(result.data?.addProxy.message || 'Failed to add proxy')
      }
    } catch (error) {
      console.error('Add proxy error:', error)
      toast.error('Failed to add proxy')
    } finally {
      setIsAddingProxy(false)
      toast.dismiss()
    }
  }, [client, newProxyAddress, proxies, refetchProxies])

  const handleRemoveProxy = useCallback(
    async (proxyAddress: string) => {
      try {
        setIsRemovingProxy(true)
        setRemovingAddress(proxyAddress)
        toast.loading('Removing proxy...')

        const result = await client
          .mutation(removeProxyMutation, {
            address: proxyAddress,
          })
          .toPromise()

        if (result.data?.removeProxy.success) {
          toast.success(
            result.data.removeProxy.message || 'Proxy removed successfully!'
          )
          void refetchProxies()
        } else {
          toast.error(
            result.data?.removeProxy.message || 'Failed to remove proxy'
          )
        }
      } catch (error) {
        console.error('Remove proxy error:', error)
        toast.error('Failed to remove proxy')
      } finally {
        setIsRemovingProxy(false)
        setRemovingAddress('')
        toast.dismiss()
      }
    },
    [client, refetchProxies]
  )

  if (showLoading) {
    return (
      <div className="flex h-[600px] w-full flex-col items-center justify-center gap-8 rounded-3xl bg-nuclear-blast p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-bright-greek border-t-transparent"></div>
          <div className="text-lg text-bright-greek">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-nuclear-blast p-4 pt-6 flex flex-col gap-[9px] text-center rounded-xl"
      style={{
        lineHeight: 'normal',
      }}
    >
      <p
        className="text-2xl text-bright-greek uppercase"
        style={{
          lineHeight: 'normal',
        }}
      >
        PROXY MANAGEMENT
      </p>
      <p className="text-19 text-jet-0.6">
        Proxy management works with{' '}
        <span
          className="text-bright-greek underline hover:text-bright-greek/80 cursor-pointer"
          onClick={() => {
            return frameSdk.actions.openUrl('https://pigeon.trade')
          }}
        >
          pigeon.trade
        </span>{' '}
        to let Pigeon AI agent automatically run tasks like claiming eggs and
        jackpot tickets while you maintain ownership of your assets.
      </p>
      <div className="h-px w-full bg-matcha-powder-0.5" />

      {/* Add New Proxy */}
      <div className="flex flex-col gap-2">
        <p className="text-19 text-bright-greek text-left">
          Add Proxy Address:
        </p>
        <input
          type="text"
          value={newProxyAddress}
          onChange={(e) =>
            setNewProxyAddress((e.target as HTMLInputElement).value)
          }
          placeholder="Enter proxy address (0x...)"
          className="flex-1 p-2 rounded border border-matcha-powder-0.5 text-black"
        />
      </div>

      <ActionButton
        backgroundColor="bg-moot-green"
        textColor="text-white"
        onClick={handleAddProxy}
        disabled={!newProxyAddress || isAddingProxy}
      >
        {isAddingProxy ? 'ADDING...' : 'ADD PROXY'}
      </ActionButton>

      {/* Current Proxies */}
      <div className="w-full h-px bg-matcha-powder-0.5" />
      <div className="flex flex-row justify-between text-19 text-bright-greek">
        <p>Current Proxies</p>
        <p>{proxies.length}</p>
      </div>

      {proxies.length === 0 ? (
        <p className="text-19 text-jet-0.6 text-center">
          No proxies configured
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {proxies.map((proxy, index) => (
            <div
              key={proxy.address}
              className="flex items-center justify-between bg-bright-greek/10 p-3 rounded text-left"
            >
              <div className="flex flex-col min-w-0 flex-1">
                <div className="text-15 font-mono text-bright-greek break-all">
                  {proxy.address}
                </div>
                <div className="text-13 text-bright-greek/60">
                  Proxy #{index + 1}
                </div>
              </div>
              <button
                onClick={() => handleRemoveProxy(proxy.address)}
                disabled={isRemovingProxy && removingAddress === proxy.address}
                className="ml-3 rounded bg-red-500 px-2 py-1 text-13 text-white hover:bg-red-600 disabled:opacity-50 flex-shrink-0"
              >
                {isRemovingProxy && removingAddress === proxy.address
                  ? '...'
                  : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="w-full h-px bg-matcha-powder-0.5" />
      <ActionButton
        backgroundColor="bg-bright-greek"
        textColor="text-nuclear-blast"
        onClick={closeModal}
      >
        CLOSE
      </ActionButton>
    </div>
  )
}
