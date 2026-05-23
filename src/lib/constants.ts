export const PROJECT_ATTRIBUTE = 'soulstore'

export const BRAGA_RPC = 'https://braga.hoodi.arkiv.network/rpc'
export const BRAGA_EXPLORER = 'https://explorer.braga.hoodi.arkiv.network'
export const BRAGA_FAUCET = 'https://braga.hoodi.arkiv.network/faucet/'

export const SOUL_CATEGORIES = [
  { id: 'coding', label: 'Coding', description: 'Engineering & dev assistants' },
  { id: 'research', label: 'Research', description: 'Data & knowledge agents' },
  { id: 'creative', label: 'Creative', description: 'Writing & storytelling' },
  { id: 'analyst', label: 'Analyst', description: 'Finance & data analysis' },
  { id: 'security', label: 'Security', description: 'Threat modeling & audits' },
  { id: 'strategy', label: 'Strategy', description: 'Business & planning' },
  { id: 'debate', label: 'Debate', description: 'Argumentation & discourse' },
  { id: 'analysis', label: 'Analysis', description: 'Deep research & insights' },
  { id: 'trading', label: 'Trading', description: 'Markets & trading strategies' },
  { id: 'devops', label: 'DevOps', description: 'Infrastructure & automation' },
  { id: 'writing', label: 'Writing', description: 'Content & copywriting' },
  { id: 'other', label: 'Other', description: 'General purpose' },
]

export const LICENSE_TIERS = {
  personal: {
    label: 'Personal',
    description: 'Non-commercial use',
    durationDays: [30, 90, 365],
  },
  commercial: {
    label: 'Commercial',
    description: 'Commercial & SaaS use',
    durationDays: [30, 90, 365],
  },
}
