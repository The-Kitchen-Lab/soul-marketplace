export interface Soul {
  id: string
  name: string
  category: string
  description: string
  price: string
  creator: string
}

export const SAMPLE_SOULS: Soul[] = [
  // coding
  {
    id: 'soul-coding-001',
    name: 'Refactor Bot',
    category: 'coding',
    description: 'Analyzes your codebase and suggests clean, idiomatic refactors with zero ceremony.',
    price: '0.05',
    creator: '0xDev1',
  },
  {
    id: 'soul-coding-002',
    name: 'PR Reviewer',
    category: 'coding',
    description: 'Reviews pull requests for bugs, security issues, and style violations in seconds.',
    price: '0.03',
    creator: '0xDev2',
  },
  {
    id: 'soul-coding-003',
    name: 'Test Writer',
    category: 'coding',
    description: 'Generates comprehensive unit and integration tests from your existing functions.',
    price: '0.04',
    creator: '0xDev3',
  },

  // research
  {
    id: 'soul-research-001',
    name: 'Deep Diver',
    category: 'research',
    description: 'Synthesizes academic papers and web sources into structured research briefs.',
    price: '0.08',
    creator: '0xResearch1',
  },
  {
    id: 'soul-research-002',
    name: 'Fact Checker',
    category: 'research',
    description: 'Cross-references claims against primary sources and flags contradictions.',
    price: '0.06',
    creator: '0xResearch2',
  },

  // creative
  {
    id: 'soul-creative-001',
    name: 'Story Weaver',
    category: 'creative',
    description: 'Collaborates on long-form fiction with consistent characters and plot arcs.',
    price: '0.04',
    creator: '0xCreative1',
  },
  {
    id: 'soul-creative-002',
    name: 'Pitch Crafter',
    category: 'creative',
    description: 'Turns rough ideas into punchy, investor-ready narratives.',
    price: '0.05',
    creator: '0xCreative2',
  },

  // analyst
  {
    id: 'soul-analyst-001',
    name: 'Excel Oracle',
    category: 'analyst',
    description: 'Interprets spreadsheet data and produces actionable financial summaries.',
    price: '0.07',
    creator: '0xAnalyst1',
  },
  {
    id: 'soul-analyst-002',
    name: 'KPI Tracker',
    category: 'analyst',
    description: 'Monitors business metrics and surfaces anomalies before they become problems.',
    price: '0.09',
    creator: '0xAnalyst2',
  },

  // security
  {
    id: 'soul-security-001',
    name: 'Threat Modeler',
    category: 'security',
    description: 'Maps attack surfaces and generates STRIDE threat models for your architecture.',
    price: '0.12',
    creator: '0xSec1',
  },
  {
    id: 'soul-security-002',
    name: 'Smart Contract Auditor',
    category: 'security',
    description: 'Scans Solidity and Cairo contracts for reentrancy, overflows, and access issues.',
    price: '0.15',
    creator: '0xSec2',
  },

  // strategy
  {
    id: 'soul-strategy-001',
    name: 'GTM Advisor',
    category: 'strategy',
    description: 'Builds go-to-market playbooks tailored to your product stage and audience.',
    price: '0.10',
    creator: '0xStrategy1',
  },
  {
    id: 'soul-strategy-002',
    name: 'Competitive Scout',
    category: 'strategy',
    description: 'Profiles competitors and identifies defensible positioning opportunities.',
    price: '0.08',
    creator: '0xStrategy2',
  },

  // debate
  {
    id: 'soul-debate-001',
    name: 'Devil\'s Advocate',
    category: 'debate',
    description: 'Steelmans opposing arguments to stress-test your reasoning.',
    price: '0.04',
    creator: '0xDebate1',
  },
  {
    id: 'soul-debate-002',
    name: 'Socratic Challenger',
    category: 'debate',
    description: 'Probes your assumptions with targeted questions until the truth surfaces.',
    price: '0.03',
    creator: '0xDebate2',
  },

  // analysis
  {
    id: 'soul-analysis-001',
    name: 'Root Cause Hunter',
    category: 'analysis',
    description: 'Applies five-why and fishbone methods to diagnose complex system failures.',
    price: '0.07',
    creator: '0xAnalysis1',
  },
  {
    id: 'soul-analysis-002',
    name: 'Trend Spotter',
    category: 'analysis',
    description: 'Detects emerging signals in noisy datasets before consensus forms.',
    price: '0.09',
    creator: '0xAnalysis2',
  },

  // trading
  {
    id: 'soul-trading-001',
    name: 'Quant Strategist',
    category: 'trading',
    description: 'Backtests systematic strategies across crypto and equity markets.',
    price: '0.20',
    creator: '0xTrading1',
  },
  {
    id: 'soul-trading-002',
    name: 'Risk Guard',
    category: 'trading',
    description: 'Monitors open positions and alerts on drawdown thresholds in real time.',
    price: '0.15',
    creator: '0xTrading2',
  },

  // devops
  {
    id: 'soul-devops-001',
    name: 'Pipeline Builder',
    category: 'devops',
    description: 'Generates CI/CD workflows for GitHub Actions, GitLab, and CircleCI.',
    price: '0.06',
    creator: '0xDevOps1',
  },
  {
    id: 'soul-devops-002',
    name: 'Incident Commander',
    category: 'devops',
    description: 'Coordinates on-call runbooks and post-mortem templates during outages.',
    price: '0.08',
    creator: '0xDevOps2',
  },

  // writing
  {
    id: 'soul-writing-001',
    name: 'Newsletter Ghost',
    category: 'writing',
    description: 'Writes engaging weekly newsletters that sound exactly like you.',
    price: '0.05',
    creator: '0xWriting1',
  },
  {
    id: 'soul-writing-002',
    name: 'SEO Scribe',
    category: 'writing',
    description: 'Crafts search-optimized articles that rank without feeling robotic.',
    price: '0.06',
    creator: '0xWriting2',
  },

  // other
  {
    id: 'soul-other-001',
    name: 'Daily Planner',
    category: 'other',
    description: 'Turns your task dump into a prioritized, time-blocked daily schedule.',
    price: '0.02',
    creator: '0xOther1',
  },
  {
    id: 'soul-other-002',
    name: 'Meeting Summarizer',
    category: 'other',
    description: 'Converts meeting transcripts into action items and decision logs.',
    price: '0.03',
    creator: '0xOther2',
  },
]
