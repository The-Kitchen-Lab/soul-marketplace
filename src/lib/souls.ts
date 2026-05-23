import { jsonToPayload } from '@arkiv-network/sdk'
import { eq } from '@arkiv-network/sdk/query'
import { publicClient } from './arkiv'
import { PROJECT_ATTRIBUTE } from './constants'
import type { SoulEntity, CreateSoulInput, ArkivEntity } from '@/types'

const DAY_SECS = 86400

// SDK returns payload as Uint8Array; decode it to a plain object before reading fields.
function decodePayload(entity: ArkivEntity): Record<string, unknown> {
  if (!entity.payload) return {}
  const p = entity.payload as unknown
  if (p instanceof Uint8Array) {
    try {
      return JSON.parse(new TextDecoder().decode(p)) as Record<string, unknown>
    } catch {
      return {}
    }
  }
  return entity.payload
}

function entityToSoul(entity: ArkivEntity): SoulEntity {
  const get = (key: string) =>
    entity.attributes?.find((a) => a.key === key)?.value ?? ''

  // SDK Entity exposes owner/creator as direct fields (not nested under metadata)
  const raw = entity as unknown as Record<string, unknown>
  const payload = decodePayload(entity)

  return {
    key: entity.key,
    name: get('name') || 'Unnamed Soul',
    description: get('description') || '',
    category: get('category') || 'other',
    price: get('price') || '0',
    creator: (raw.creator as string) ?? entity.metadata?.$creator ?? '',
    owner: (raw.owner as string) ?? entity.metadata?.$owner ?? '',
    forkedFrom: get('forkedFrom') || undefined,
    prompt: (payload.prompt as string) || undefined,
    createdAt: raw.createdAtBlock !== undefined
      ? Number(raw.createdAtBlock as bigint)
      : entity.metadata?.createdAt,
    expiresAt: raw.expiresAtBlock !== undefined
      ? Number(raw.expiresAtBlock as bigint)
      : entity.metadata?.expiresAt,
  }
}

export async function createSoul(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletClient: any,
  input: CreateSoulInput
): Promise<{ entityKey: string; txHash: string }> {
  const attributes = [
    { key: 'app', value: PROJECT_ATTRIBUTE },
    { key: 'type', value: 'soul' },
    { key: 'name', value: input.name },
    { key: 'description', value: input.description },
    { key: 'category', value: input.category },
    { key: 'price', value: input.price },
  ]

  if (input.forkedFrom) {
    attributes.push({ key: 'forkedFrom', value: input.forkedFrom })
  }

  const result = await walletClient.createEntity({
    payload: jsonToPayload({
      prompt: input.prompt,
      version: '1',
    }),
    contentType: 'application/json',
    attributes,
    expiresIn: 365 * DAY_SECS,
  })

  return result
}

export async function getSoul(key: string): Promise<SoulEntity | null> {
  try {
    const entity = await publicClient.getEntity(key as `0x${string}`)
    if (!entity) return null
    return entityToSoul(entity as unknown as ArkivEntity)
  } catch {
    return null
  }
}

export async function querySouls(filters: {
  category?: string
  creator?: string
  limit?: number
} = {}): Promise<SoulEntity[]> {
  const predicates = [
    eq('app', PROJECT_ATTRIBUTE),
    eq('type', 'soul'),
  ]
  if (filters.category) {
    predicates.push(eq('category', filters.category))
  }

  let q = publicClient
    .buildQuery()
    .where(predicates)
    .withPayload(false)
    .withAttributes(true)
    .withMetadata(true)
    .limit(filters.limit ?? 50)

  if (filters.creator) {
    q = q.createdBy(filters.creator as `0x${string}`)
  }

  const result = await q.fetch()
  return result.entities.map((e) => entityToSoul(e as unknown as ArkivEntity))
}

export async function getSoulWithPrompt(key: string): Promise<SoulEntity | null> {
  try {
    // getEntity fetches the full entity including payload (as Uint8Array)
    const entity = await publicClient.getEntity(key as `0x${string}`)
    if (!entity) return null
    return entityToSoul(entity as unknown as ArkivEntity)
  } catch {
    return null
  }
}

export async function updateSoulPrompt(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletClient: any,
  soul: SoulEntity,
  prompt: string
): Promise<{ entityKey: string; txHash: string }> {
  let expiresIn = 365 * DAY_SECS

  if (soul.expiresAt && soul.expiresAt > 0) {
    const { currentBlock, blockDuration } = await publicClient.getBlockTiming()
    const remainingBlocks = soul.expiresAt - Number(currentBlock)
    if (remainingBlocks > 0) {
      expiresIn = remainingBlocks * blockDuration
    }
  }

  const attributes: { key: string; value: string }[] = [
    { key: 'app', value: PROJECT_ATTRIBUTE },
    { key: 'type', value: 'soul' },
    { key: 'name', value: soul.name },
    { key: 'description', value: soul.description },
    { key: 'category', value: soul.category },
    { key: 'price', value: soul.price },
  ]
  if (soul.forkedFrom) {
    attributes.push({ key: 'forkedFrom', value: soul.forkedFrom })
  }

  return walletClient.updateEntity({
    entityKey: soul.key as `0x${string}`,
    payload: jsonToPayload({ prompt, version: '1' }),
    contentType: 'application/json',
    attributes,
    expiresIn,
  })
}

export async function getAttributionChain(soulKey: string): Promise<SoulEntity[]> {
  const chain: SoulEntity[] = []
  let currentKey: string | undefined = soulKey

  while (currentKey && chain.length < 10) {
    const soul = await getSoul(currentKey)
    if (!soul) break
    chain.push(soul)
    currentKey = soul.forkedFrom
  }

  return chain
}
