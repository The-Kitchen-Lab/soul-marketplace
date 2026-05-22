export const PROJECT_ATTRIBUTE = 'soul-marketplace'

export const BRAGA_RPC = 'https://braga.hoodi.arkiv.network/rpc'
export const BRAGA_EXPLORER = 'https://explorer.braga.hoodi.arkiv.network'
export const BRAGA_FAUCET = 'https://braga.hoodi.arkiv.network/faucet/'

export const SOUL_CATEGORIES = [
  { id: 'coding', label: '⚙️ Coding', description: 'Engineering & dev assistants' },
  { id: 'research', label: '🔬 Research', description: 'Data & knowledge agents' },
  { id: 'creative', label: '✍️ Creative', description: 'Writing & storytelling' },
  { id: 'analyst', label: '📊 Analyst', description: 'Finance & data analysis' },
  { id: 'security', label: '🛡️ Security', description: 'Threat modeling & audits' },
  { id: 'strategy', label: '♟️ Strategy', description: 'Business & planning' },
  { id: 'other', label: '🧠 Other', description: 'General purpose' },
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
