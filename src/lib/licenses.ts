import { jsonToPayload } from '@arkiv-network/sdk'
import { eq } from '@arkiv-network/sdk/query'
import { publicClient } from './arkiv'
import { PROJECT_ATTRIBUTE } from './constants'
import type { LicenseEntity, CreateLicenseInput, ArkivEntity } from '@/types'

const DAY_SECS = 86400

function entityToLicense(entity: ArkivEntity): LicenseEntity {
  const get = (key: string) =>
    entity.attributes?.find((a) => a.key === key)?.value ?? ''

  // SDK Entity exposes owner/creator as direct fields (not nested under metadata)
  const raw = entity as unknown as Record<string, unknown>

  // expiresAt stored as unix timestamp in attributes (preferred).
  // expiresAtBlock is a block number, not a timestamp — don't use it as one.
  const expiresAtAttr = get('expiresAt')
  const expiresAt = expiresAtAttr
    ? Number(expiresAtAttr)
    : entity.metadata?.expiresAt ?? 0

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
      { key: 'expiresAt', value: String(Math.floor(Date.now() / 1000) + input.durationDays * DAY_SECS) },
    ],
    expiresIn: input.durationDays * DAY_SECS,
  })

  return result
}

export async function queryLicensesByHolder(address: string): Promise<LicenseEntity[]> {
  const result = await publicClient
    .buildQuery()
    .where([eq('app', PROJECT_ATTRIBUTE), eq('type', 'license')])
    .withPayload(false)
    .withAttributes(true)
    .withMetadata(true)
    .ownedBy(address as `0x${string}`)
    .limit(100)
    .fetch()

  return result.entities.map((e) => entityToLicense(e as unknown as ArkivEntity))
}

export async function queryLicensesForSoul(soulKey: string): Promise<LicenseEntity[]> {
  const result = await publicClient
    .buildQuery()
    .where([
      eq('app', PROJECT_ATTRIBUTE),
      eq('type', 'license'),
      eq('soulKey', soulKey),
    ])
    .withAttributes(true)
    .withMetadata(true)
    .limit(200)
    .fetch()

  return result.entities.map((e) => entityToLicense(e as unknown as ArkivEntity))
}

export async function hasValidLicense(
  address: string,
  soulKey: string
): Promise<LicenseEntity | null> {
  const result = await publicClient
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
    .fetch()

  const now = Date.now() / 1000
  const valid = result.entities
    .map((e) => entityToLicense(e as unknown as ArkivEntity))
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
