'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { createArkivWalletClient } from '@/lib/arkiv'

export function useArkivWallet() {
  const { address, isConnected, connector } = useAccount()
  const [arkivWallet, setArkivWallet] = useState<ReturnType<typeof createArkivWalletClient> | null>(null)

  useEffect(() => {
    if (!isConnected || !address || !connector) {
      setArkivWallet(null)
      return
    }

    let cancelled = false
    connector.getProvider().then((provider) => {
      if (cancelled) return
      try {
        setArkivWallet(createArkivWalletClient(address, provider))
      } catch {
        setArkivWallet(null)
      }
    }).catch(() => {
      if (!cancelled) setArkivWallet(null)
    })

    return () => { cancelled = true }
  }, [address, isConnected, connector])

  return { arkivWallet, address, isConnected }
}
