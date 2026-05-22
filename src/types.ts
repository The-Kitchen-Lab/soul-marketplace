export interface SoulEntity {
  key: string
  name: string
  description: string
  category: string
  price: string
  creator: string
  owner: string
  forkedFrom?: string
  prompt?: string
  createdAt?: number
  expiresAt?: number
}

export interface LicenseEntity {
  key: string
  soulKey: string
  soulName: string
  licensee: string
  creator: string
  tier: 'personal' | 'commercial'
  expiresAt: number
  createdAt?: number
}

export interface CreateSoulInput {
  name: string
  description: string
  category: string
  price: string
  prompt: string
  forkedFrom?: string
}

export interface CreateLicenseInput {
  soulKey: string
  soulName: string
  tier: 'personal' | 'commercial'
  durationDays: number
}

export interface ArkivEntity {
  key: string
  payload?: Record<string, unknown>
  attributes?: Array<{ key: string; value: string }>
  metadata?: {
    $owner?: string
    $creator?: string
    createdAt?: number
    expiresAt?: number
  }
}
