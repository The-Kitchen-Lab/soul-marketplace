/**
 * M2 Smoke Test: create soul → buy license → fork attribution
 *
 * Uses bomber-private-key.txt as the creator/buyer wallet.
 * Tests all three on-chain operations and verifies attribution chain.
 */

import { createWalletClient, createPublicClient, http, jsonToPayload } from '@arkiv-network/sdk'
import { eq } from '@arkiv-network/sdk/query'
import { braga } from '@arkiv-network/sdk/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { readFileSync } from 'fs'

const PRIVATE_KEY = process.env.PRIVATE_KEY ??
  readFileSync('/Users/yigitberhangulabigul/clawd/.secrets/bomber-private-key.txt', 'utf-8').trim()

const PROJECT_ATTRIBUTE = 'soulstore'
const DAY_SECS = 86400

const PASS = '✓'
const FAIL = '✗'

let passed = 0
let failed = 0

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ${PASS} ${label}${detail ? ': ' + detail : ''}`)
    passed++
  } else {
    console.log(`  ${FAIL} ${label}${detail ? ': ' + detail : ''}`)
    failed++
  }
}

function decodePayload(entity) {
  const p = entity.payload
  if (!p) return {}
  if (p instanceof Uint8Array) {
    try { return JSON.parse(new TextDecoder().decode(p)) } catch { return {} }
  }
  return p ?? {}
}

async function main() {
  const account = privateKeyToAccount(PRIVATE_KEY)
  console.log(`\nSmoke Test: Soul Marketplace Happy Path`)
  console.log(`Wallet: ${account.address}`)
  console.log(`Network: Arkiv Braga Testnet\n`)

  const publicClient = createPublicClient({ chain: braga, transport: http() })
  const walletClient = createWalletClient({ chain: braga, transport: http(), account })

  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`Balance: ${Number(balance) / 1e18} GLM`)
  if (balance === 0n) {
    console.error('Zero balance — get testnet GLM from https://braga.hoodi.arkiv.network/faucet/')
    process.exit(1)
  }
  console.log()

  // ── Step 1: Create Soul ──────────────────────────────────────────────────
  console.log('Step 1: Create Soul')
  let soulKey, soulTx
  try {
    const result = await walletClient.createEntity({
      payload: jsonToPayload({ prompt: 'You are a smoke test soul. Respond concisely.', version: '1' }),
      contentType: 'application/json',
      attributes: [
        { key: 'app', value: PROJECT_ATTRIBUTE },
        { key: 'type', value: 'soul' },
        { key: 'name', value: 'Smoke Test Soul' },
        { key: 'description', value: 'Created by automated smoke test' },
        { key: 'category', value: 'coding' },
        { key: 'price', value: '0' },
      ],
      expiresIn: 30 * DAY_SECS,
    })
    soulKey = result.entityKey
    soulTx = result.txHash
    check('createEntity returned entityKey', !!soulKey, soulKey)
    check('createEntity returned txHash', !!soulTx, soulTx)
  } catch (err) {
    check('createEntity succeeded', false, err.message)
    console.log('\nAbort: cannot continue without a soul.')
    process.exit(1)
  }

  // Verify soul can be fetched
  try {
    const entity = await publicClient.getEntity(soulKey)
    check('Soul fetched by key', !!entity)
    const get = (k) => entity.attributes?.find((a) => a.key === k)?.value ?? ''
    check('Soul name matches', get('name') === 'Smoke Test Soul', get('name'))
    check('Soul app attribute', get('app') === PROJECT_ATTRIBUTE)
    check('Soul type attribute', get('type') === 'soul')
    const payload = decodePayload(entity)
    check('Soul prompt in payload', typeof payload.prompt === 'string' && payload.prompt.length > 0)
  } catch (err) {
    check('Soul fetch/verify', false, err.message)
  }

  console.log()

  // ── Step 2: Buy License ──────────────────────────────────────────────────
  console.log('Step 2: Buy License')
  let licenseKey, licenseTx
  const expiryTs = String(Math.floor(Date.now() / 1000) + 30 * DAY_SECS)
  try {
    const result = await walletClient.createEntity({
      payload: jsonToPayload({ soulKey, issuedAt: Date.now() }),
      contentType: 'application/json',
      attributes: [
        { key: 'app', value: PROJECT_ATTRIBUTE },
        { key: 'type', value: 'license' },
        { key: 'soulKey', value: soulKey },
        { key: 'soulName', value: 'Smoke Test Soul' },
        { key: 'tier', value: 'personal' },
        { key: 'licExpiry', value: expiryTs },
      ],
      expiresIn: 30 * DAY_SECS,
    })
    licenseKey = result.entityKey
    licenseTx = result.txHash
    check('createEntity returned licenseKey', !!licenseKey, licenseKey)
    check('createEntity returned txHash', !!licenseTx, licenseTx)
  } catch (err) {
    check('license createEntity succeeded', false, err.message)
  }

  // Verify license can be queried back
  if (licenseKey) {
    try {
      const result = await publicClient
        .buildQuery()
        .where([eq('app', PROJECT_ATTRIBUTE), eq('type', 'license'), eq('soulKey', soulKey)])
        .withAttributes(true)
        .withMetadata(true)
        .ownedBy(account.address)
        .limit(10)
        .fetch()

      const found = result.entities.find((e) => e.key === licenseKey)
      check('License appears in holder query', !!found)
      if (found) {
        const get = (k) => found.attributes?.find((a) => a.key === k)?.value ?? ''
        check('License soulKey matches', get('soulKey') === soulKey)
        check('License tier is personal', get('tier') === 'personal')
        check('License licExpiry is valid unix ts', Number(get('licExpiry')) > 1_000_000_000, get('licExpiry'))
      }
    } catch (err) {
      check('License query', false, err.message)
    }
  }

  console.log()

  // ── Step 3: Fork Soul + Attribution Chain ────────────────────────────────
  console.log('Step 3: Fork Soul (attribution)')
  let forkKey, forkTx
  try {
    const result = await walletClient.createEntity({
      payload: jsonToPayload({ prompt: 'You are a forked smoke test soul. You build on the original.', version: '1' }),
      contentType: 'application/json',
      attributes: [
        { key: 'app', value: PROJECT_ATTRIBUTE },
        { key: 'type', value: 'soul' },
        { key: 'name', value: 'Smoke Test Soul (Fork)' },
        { key: 'description', value: 'Fork of automated smoke test soul' },
        { key: 'category', value: 'coding' },
        { key: 'price', value: '0' },
        { key: 'forkedFrom', value: soulKey },
      ],
      expiresIn: 30 * DAY_SECS,
    })
    forkKey = result.entityKey
    forkTx = result.txHash
    check('Fork createEntity returned entityKey', !!forkKey, forkKey)
    check('Fork createEntity returned txHash', !!forkTx, forkTx)
  } catch (err) {
    check('Fork createEntity succeeded', false, err.message)
  }

  // Verify attribution chain: fork → original
  if (forkKey) {
    try {
      const forkEntity = await publicClient.getEntity(forkKey)
      check('Fork entity fetched', !!forkEntity)
      const get = (k) => forkEntity.attributes?.find((a) => a.key === k)?.value ?? ''
      const forkedFromAttr = get('forkedFrom')
      check('Fork has forkedFrom attribute', forkedFromAttr === soulKey, forkedFromAttr)

      // Walk the attribution chain
      const chain = []
      let currentKey = forkKey
      let hops = 0
      while (currentKey && hops < 10) {
        const e = await publicClient.getEntity(currentKey)
        if (!e) break
        chain.push({ key: e.key, name: e.attributes?.find((a) => a.key === 'name')?.value ?? '?' })
        const ff = e.attributes?.find((a) => a.key === 'forkedFrom')?.value
        currentKey = ff || null
        hops++
      }

      check('Attribution chain has 2 entries', chain.length === 2, `chain length: ${chain.length}`)
      check('Chain[0] is the fork', chain[0]?.key === forkKey)
      check('Chain[1] is the original', chain[1]?.key === soulKey)

      if (chain.length >= 2) {
        console.log(`  → ${chain[0].name} (fork)`)
        console.log(`  → ${chain[1].name} (original)`)
      }
    } catch (err) {
      check('Attribution chain walk', false, err.message)
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log()
  console.log('──────────────────────────────────')
  console.log(`Results: ${passed} passed, ${failed} failed`)
  if (failed === 0) {
    console.log('STATUS: ALL CHECKS PASSED')
  } else {
    console.log('STATUS: SOME CHECKS FAILED')
    process.exitCode = 1
  }

  console.log()
  console.log('On-chain references:')
  if (soulKey)    console.log(`  Soul:    ${soulKey}`)
  if (licenseKey) console.log(`  License: ${licenseKey}`)
  if (forkKey)    console.log(`  Fork:    ${forkKey}`)
  console.log()
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
