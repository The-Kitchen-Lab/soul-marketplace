import { createPublicClient, createWalletClient, http, custom } from '@arkiv-network/sdk'
import { braga } from '@arkiv-network/sdk/chains'

export { braga }

export const publicClient = createPublicClient({
  chain: braga,
  transport: http(),
})

export function createArkivWalletClient(address: `0x${string}`) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No browser wallet detected')
  }
  return createWalletClient({
    chain: braga,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transport: custom(window.ethereum as any),
    account: address,
  })
}
