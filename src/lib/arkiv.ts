import { createPublicClient, createWalletClient, http, custom } from '@arkiv-network/sdk'
import { braga } from '@arkiv-network/sdk/chains'

export { braga }

export const publicClient = createPublicClient({
  chain: braga,
  transport: http(),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createArkivWalletClient(address: `0x${string}`, provider: any) {
  if (!provider) throw new Error('No EIP-1193 provider supplied')
  return createWalletClient({
    chain: braga,
    transport: custom(provider),
    account: address,
  })
}
