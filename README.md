# AgentPay Receipts

Escrow-style task payments and verifiable receipts for AI/API agents on Solana.

## Problem

AI agents can produce useful work, but there is no simple payment trail for who requested the work, what was delivered, who approved it, and when the agent got paid.

## Solution

AgentPay gives every paid agent task an escrow-style approval flow and a public receipt. This build includes a native Anchor program for SOL escrow on Solana devnet plus a React app for the demo workflow.

## Demo Flow

1. Create a paid agent task.
2. Create the onchain task account with a connected wallet.
3. Fund SOL escrow.
4. Run the agent and generate provider-style evidence.
5. Approve the deliverable hash onchain.
6. Release payment to the agent wallet.
7. Open the public receipt with hashes, timeline, escrow PDA, and transaction links.
8. Open `/verify/:hash` to search the browser receipt cache and compare against the Anchor account when onchain state exists.

For the fastest judging path, the dashboard includes a seeded paid task that links directly to a complete receipt page. It is marked as demo-local so generated transaction links are not mistaken for devnet settlement.

## Submission Links

- GitHub: `https://github.com/your-org/agentpay-receipts`
- Live app: `https://agentpay-receipts.vercel.app`
- Loom: `https://www.loom.com/share/agentpay-receipts-demo`
- Colosseum: `https://www.colosseum.org/`

## Tracks

- 100xDevs Frontier Hackathon Track
- SagaPad agentic skills
- Zerion/Covalent/Dune data track, if provider evidence is emphasized

## Tech Stack

- Anchor `0.32.1`
- Solana devnet/localnet
- Vite + React + TypeScript
- React Router
- Phantom wallet adapter
- localStorage for cached demo metadata

## Project Structure

```txt
programs/agentpay_escrow/   Anchor SOL escrow program
tests/agentpay_escrow.ts    Anchor integration tests
app/                        Vite React frontend
app/public/screenshots/     Judge/demo screenshots placeholder
```

## Judge Checklist

- Seeded paid receipt is available from the dashboard without a wallet.
- Wallet-created tasks use Phantom-compatible signing and the Anchor SOL escrow program.
- Task, deliverable, and receipt hashes are shown on the receipt and verifier surfaces.
- Demo-local receipts are explicitly labeled as local state with generated tx links.
- Provider evidence is visible for Zerion, Covalent, Dune SIM, LPAgent, and Demo Agent flows.

## 90-second Demo Script

1. Show the dashboard, provider strip, activity rail, and seeded complete receipt shortcut.
2. Create a task from the Wallet risk report preset and point out validation plus the live receipt preview.
3. Connect Phantom and create/fund the Anchor escrow task on devnet or localnet.
4. Run the agent, complete the three-step progress sequence, approve the deliverable hash, and release payment.
5. Open the receipt and then `/verify/:hash` to show cache lookup and onchain hash comparison.

## Why Solana

AgentPay relies on cheap, fast, wallet-native settlement for small agent jobs. Solana account state lets the app store task, deliverable, and receipt hashes directly on the escrow account while keeping the public receipt inexpensive to verify.

## What We Would Build Next

- SPL token escrow for USDC and USDT.
- Backend indexing for receipt search across payers, agents, and hashes.
- Real provider integrations for Zerion, Covalent, Dune SIM, and LPAgent.
- Revision, dispute, cancellation cleanup, and account close flows.
- Production screenshot set in `app/public/screenshots/`.

## Run Locally

Install dependencies:

```bash
npm install
npm --prefix app install
```

Build everything:

```bash
npm run build
```

Run the Anchor test suite:

```bash
npm test
```

Start a local validator:

```bash
solana-test-validator --reset
```

In another terminal, fund the local deploy wallet and deploy the program:

```bash
solana airdrop 5 .anchor/test-wallet.json --url localhost
anchor deploy --provider.cluster localnet --provider.wallet .anchor/test-wallet.json
```

Start the frontend against localnet:

```bash
npm run dev
```

The app runs against localnet by default. To point it at devnet, use:

```bash
VITE_SOLANA_CLUSTER=devnet VITE_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com npm run dev
```

Seeded demo-local tasks are included for judges without a wallet.

## Prototype Notes

Wallet-created tasks use the native Anchor SOL escrow program. Seeded tasks use local demo state. The production version would add SPL token escrow for USDC/USDT, backend indexing, account cleanup, dispute/revision flows, and real provider API integrations.
