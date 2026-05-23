import { jsonToPayload } from '@arkiv-network/sdk'
import { eq } from '@arkiv-network/sdk/query'
import { publicClient } from './arkiv'
import { PROJECT_ATTRIBUTE } from './constants'
import type { LicenseEntity, CreateLicenseInput, ArkivEntity } from '@/types'

const DAY_SECS = 86400

type BlockInfo = { currentBlock: bigint; blockDuration: number }

async function getBlockInfo(): Promise<BlockInfo | null> {
  try {
    const t = await publicClient.getBlockTiming()
    return { currentBlock: t.currentBlock, blockDuration: t.blockDuration || 2 }
  } catch {
    return null
  }
}

function entityToLicense(entity: ArkivEntity, blockInfo?: BlockInfo | null): LicenseEntity {
  const get = (key: string) =>
    entity.attributes?.find((a) => a.key === key)?.value ?? ''

  const raw = entity as unknown as Record<string, unknown>

  // licExpiry: unix timestamp (seconds) we write explicitly on every mint.
  // Avoid 'expiresAt' — the Arkiv RPC may expose the on-chain expiry block as a
  // numeric attribute under that same key (~1-2M), which fails the >1B check.
  // Fall back to 'expiresAt' for licenses minted before this key was introduced.
  const rawExpiry = get('licExpiry') || get('expiresAt')
  let expiresAt = rawExpiry && Number(rawExpiry) > 1_000_000_000 ? Number(rawExpiry) : 0

  // Fallback: derive Unix expiry from the entity's on-chain expiresAtBlock.
  // This handles licenses minted before the licExpiry attribute was introduced
  // (no custom attribute present) using block arithmetic against the current block.
  if (!expiresAt && blockInfo) {
    const expiresAtBlock = raw.expiresAtBlock as bigint | undefined
    if (expiresAtBlock !== undefined && expiresAtBlock > BigInt(0)) {
      const blocksDiff = Number(expiresAtBlock - blockInfo.currentBlock)
      expiresAt = Math.floor(Date.now() / 1000) + blocksDiff * blockInfo.blockDuration
    }
  }

  return {
    key: entity.key,
    soulKey: get('soulKey'),
    soulName: get('soulName'),
    licensee: (raw.owner as string) ?? entity.metadata?.$owner ?? '',
    creator: (raw.creator as string) ?? entity.metadata?.$creator ?? '',
    tier: (get('tier') as 'personal' | 'commercial') || 'personal',
    expiresAt,
    createdAt: raw.createdAtBlock !== undefined
      ? Number(raw.createdAtBlock as bigint)
      : entity.metadata?.createdAt,
  }
}

export async function createLicense(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletClient: any,
  input: CreateLicenseInput
): Promise<{ entityKey: string; txHash: string }> {
  const result = await walletClient.createEntity({
    payload: jsonToPayload({
      soulKey: input.soulKey,
      issuedAt: Date.now(),
    }),
    contentType: 'application/json',
    attributes: [
      { key: 'app', value: PROJECT_ATTRIBUTE },
      { key: 'type', value: 'license' },
      { key: 'soulKey', value: input.soulKey },
      { key: 'soulName', value: input.soulName },
      { key: 'tier', value: input.tier },
      { key: 'licExpiry', value: String(Math.floor(Date.now() / 1000) + input.durationDays * DAY_SECS) },
    ],
    expiresIn: input.durationDays * DAY_SECS,
  })

  return result
}

export async function queryLicensesByHolder(address: string): Promise<LicenseEntity[]> {
  const [result, blockInfo] = await Promise.all([
    publicClient
      .buildQuery()
      .where([eq('app', PROJECT_ATTRIBUTE), eq('type', 'license')])
      .withPayload(false)
      .withAttributes(true)
      .withMetadata(true)
      .ownedBy(address as `0x${string}`)
      .limit(100)
      .fetch(),
    getBlockInfo(),
  ])

  return result.entities.map((e) => entityToLicense(e as unknown as ArkivEntity, blockInfo))
}

export async function queryLicensesForSoul(soulKey: string): Promise<LicenseEntity[]> {
  const [result, blockInfo] = await Promise.all([
    publicClient
      .buildQuery()
      .where([
        eq('app', PROJECT_ATTRIBUTE),
        eq('type', 'license'),
        eq('soulKey', soulKey),
      ])
      .withAttributes(true)
      .withMetadata(true)
      .limit(200)
      .fetch(),
    getBlockInfo(),
  ])

  return result.entities.map((e) => entityToLicense(e as unknown as ArkivEntity, blockInfo))
}

export async function hasValidLicense(
  address: string,
  soulKey: string
): Promise<LicenseEntity | null> {
  const [result, blockInfo] = await Promise.all([
    publicClient
      .buildQuery()
      .where([
        eq('app', PROJECT_ATTRIBUTE),
        eq('type', 'license'),
        eq('soulKey', soulKey),
      ])
      .withAttributes(true)
      .withMetadata(true)
      .ownedBy(address as `0x${string}`)
      .limit(10)
      .fetch(),
    getBlockInfo(),
  ])

  const now = Date.now() / 1000
  const valid = result.entities
    .map((e) => entityToLicense(e as unknown as ArkivEntity, blockInfo))
    .find((l) => !l.expiresAt || l.expiresAt > now)

  return valid ?? null
}

export function isLicenseActive(license: LicenseEntity): boolean {
  if (!license.expiresAt) return true
  return license.expiresAt > Date.now() / 1000
}

export function formatExpiry(license: LicenseEntity): string {
  if (!license.expiresAt) return 'No expiry'
  const date = new Date(license.expiresAt * 1000)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  if (diff < 0) return 'Expired'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 365) return `${Math.floor(days / 365)}y left`
  if (days > 30) return `${Math.floor(days / 30)}mo left`
  return `${days}d left`
}
