'use client'

import { ReactNode } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'
import '@rainbow-me/rainbowkit/styles.css'

const braga = defineChain({
  id: 60138453102,
  name: 'Arkiv Braga',
  nativeCurrency: { name: 'GLM', symbol: 'GLM', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://braga.hoodi.arkiv.network/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Braga Explorer',
      url: 'https://explorer.braga.hoodi.arkiv.network',
    },
  },
  testnet: true,
})

const wagmiConfig = createConfig({
  chains: [braga],
  transports: {
    [braga.id]: http('https://braga.hoodi.arkiv.network/rpc'),
  },
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#f2f2f2',
            accentColorForeground: '#0e0e0e',
            borderRadius: 'none',
            overlayBlur: 'none',
            fontStack: 'system',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
