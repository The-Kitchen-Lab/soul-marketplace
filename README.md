# SoulStore

> *AI agents whose soul you actually own.*

SoulStore is a Web3-native platform where AI system prompts live as on-chain entities on Arkiv. The creator is immutably recorded. Licenses expire. Forks preserve the attribution chain. No platform owns your agents — you do.

**Theme:** AI — agents whose memory you actually own  
**Network:** Arkiv Braga Testnet  
**Hackathon:** ETHns × Arkiv Challenge

---

## How It Works

### Two Entity Types

**Soul** — a system prompt as an on-chain entity
- `$creator`: immutable, tamper-proof attribution
- `$owner`: current controller (can transfer)
- Attributes: `app`, `type`, `name`, `description`, `category`, `price`, `forkedFrom`
- Payload: the system prompt content

**License** — time-limited access to a Soul
- `$owner`: the licensee (owner of the license)
- `$creator`: the soul author (immutable)
- Attributes: `app`, `type`, `soulKey`, `soulName`, `tier`
- `expiresIn`: enforced by Arkiv's entity TTL

### The Attribution Chain

When you fork a Soul, the `forkedFrom` attribute points to the original entity key. The original creator's `$creator` field is immutable — it cannot be forged or overwritten. The app traverses the fork chain to display the full lineage.

### PROJECT_ATTRIBUTE

Every entity and every query uses the attribute key `app` with value `soulstore`. This namespaces all data to this project on the shared Arkiv network.

---

## Setup

### Prerequisites

- Node.js 22.10.0+
- A wallet with Arkiv Braga testnet GLM tokens
- Get testnet tokens at: https://braga.hoodi.arkiv.network/faucet/

### Install

```bash
git clone https://github.com/The-Kitchen-Lab/soulstore
cd soulstore
npm install
```

### Configure

```bash
cp .env.example .env.local
```

No environment variables are required for the demo — everything runs client-side against the public Arkiv Braga RPC.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Add Braga to MetaMask

| Field | Value |
|---|---|
| Network Name | Arkiv Braga |
| RPC URL | https://braga.hoodi.arkiv.network/rpc |
| Chain ID | 60138453102 |
| Currency Symbol | GLM |
| Block Explorer | https://explorer.braga.hoodi.arkiv.network |

---

## Architecture

```
soulstore/
├── src/
│   ├── lib/
│   │   ├── constants.ts     # PROJECT_ATTRIBUTE = "soulstore"
│   │   ├── arkiv.ts         # Arkiv public + wallet clients
│   │   ├── souls.ts         # Soul entity CRUD + attribution chain
│   │   └── licenses.ts      # License entity CRUD + expiry checks
│   ├── hooks/
│   │   └── useArkivWallet.ts
│   ├── components/
│   │   ├── Providers.tsx    # Wagmi + RainbowKit (Braga chain)
│   │   ├── NavBar.tsx
│   │   ├── SoulCard.tsx
│   │   └── AttributionChain.tsx
│   └── app/
│       ├── page.tsx         # Marketplace with category filter
│       ├── create/          # Create / fork a soul
│       ├── soul/[key]/      # Detail: buy license, reveal prompt, fork
│       └── library/         # User's owned licenses
```

### Entity Design

```
SOUL entity attributes:
  app          = "soulstore"   ← PROJECT_ATTRIBUTE (required)
  type         = "soul"
  name         = "Senior Rust Engineer"
  description  = "..."
  category     = "coding"
  price        = "0"
  forkedFrom   = <parent entity key>  ← optional, builds attribution chain

LICENSE entity attributes:
  app          = "soulstore"   ← PROJECT_ATTRIBUTE (required)
  type         = "license"
  soulKey      = <soul entity key>    ← relationship via shared key
  soulName     = "..."
  tier         = "personal" | "commercial"

LICENSE entity expiresIn:
  Set via ExpirationTime.fromDays(30|90|365)
  Arkiv enforces TTL — no server needed
```

---

## Privacy Note

For this demo, soul prompts are stored in plaintext in the entity payload (readable by licensees after acquiring a license). The app enforces access control at the UI layer — the prompt is only shown to the soul creator or holders of a valid, unexpired license.

In a production deployment, integrate [Lit Protocol](https://litprotocol.com/) or implement ECIES envelope encryption to achieve cryptographic access control. The entity model (Soul + License) remains identical — only the payload would be ciphertext.

---

## Submission

- **Theme:** AI
- **Network:** Arkiv Braga Testnet
- **PROJECT_ATTRIBUTE:** `soulstore` (on every entity and query)
- **Entity types:** Soul, License
- **GitHub:** [github.com/The-Kitchen-Lab/soulstore](https://github.com/The-Kitchen-Lab/soulstore)
- **Demo:** [DEPLOYING...]

---

## Team

| Name | GitHub | Wallet |
|------|--------|--------|
| Yiğit Gülabiğül | @Zedit42 | YOUR_WALLET |
