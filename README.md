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
```

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

Start the frontend:

```bash
npm run dev
```

The app runs against devnet by default. Seeded demo-local tasks are included for judges without a wallet.

## Prototype Notes

Wallet-created tasks use the native Anchor SOL escrow program. Seeded tasks use local demo state. The production version would add SPL token escrow for USDC/USDT, backend indexing, account cleanup, dispute/revision flows, and real provider API integrations.
