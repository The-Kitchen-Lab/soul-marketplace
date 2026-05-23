import { createPublicClient, createWalletClient, http, custom } from '@arkiv-network/sdk'
import { braga } from '@arkiv-network/sdk/chains'

export { braga }

export const publicClient = createPublicClient({
  chain: braga,
  transport: http(),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createArkivWalletClient(address: `0x${string}`, provider?: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eip1193 = provider ?? (typeof window !== 'undefined' ? (window as any).ethereum : null)
  if (!eip1193) throw new Error('No browser wallet detected')
  return createWalletClient({
    chain: braga,
    transport: custom(eip1193),
    account: address,
  })
}
