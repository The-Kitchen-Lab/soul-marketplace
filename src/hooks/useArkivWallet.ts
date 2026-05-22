'use client'

import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { createArkivWalletClient } from '@/lib/arkiv'

export function useArkivWallet() {
  const { address, isConnected } = useAccount()

  const arkivWallet = useMemo(() => {
    if (!isConnected || !address || typeof window === 'undefined') return null
    try {
      return createArkivWalletClient(address)
    } catch {
      return null
    }
  }, [address, isConnected])

  return { arkivWallet, address, isConnected }
}
