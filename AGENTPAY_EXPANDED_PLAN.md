# AgentPay Receipts: Expanded Frontier Submission Plan

## Product Thesis

AgentPay Receipts is a narrow payment accountability layer for paid AI-agent work.

The demo should answer one question clearly:

> If an AI agent does paid work for a human or team, what proves the task was funded, delivered, approved, and paid?

The expanded version should include a real native Anchor program on Solana devnet. The frontend remains the demo surface, but task creation, escrow funding, approval, payout release, and receipt metadata should have an onchain backbone.

## Updated Scope

Keep the original user-facing flow:

- Create a paid agent task.
- Fund escrow through a native Anchor program on devnet.
- Run an agent.
- Review deliverable.
- Approve payout onchain.
- Release payment from escrow to the agent.
- Generate a public receipt.

Use the extra time for real Solana credibility, not for broadening into a marketplace.

Add these upgrades:

- Native Anchor program for SOL escrow.
- Devnet deployment and frontend client integration.
- Wallet connection for payer actions.
- A stronger receipt verification screen.
- A provider evidence panel showing what data the agent used.
- Phantom wallet detection and wallet identity display.
- Local demo fallback only for seeded tasks and judges without a wallet.
- Better seeded scenarios for judges.
- Better README, pitch copy, screenshots, and Loom script.

Do not add:

- Full marketplace scope.
- SPL token escrow until SOL escrow is deployed and tested.
- User accounts.
- Backend database.
- Agent marketplace features.
- Reputation, disputes, or team management.

## Demo Positioning

One-line pitch:

> AgentPay gives paid AI-agent work an escrow-style approval flow and a public Solana receipt.

Longer pitch:

> AI agents can already analyze wallets, summarize onchain activity, and produce useful work, but payment accountability is still messy. AgentPay Receipts creates a clear trail from task creation to funding, delivery, approval, payout, and receipt verification.

Judge-friendly framing:

- This is not trying to be a generic agent marketplace.
- The prototype includes native SOL escrow on Solana devnet.
- SPL token settlement is a production/stretch extension.
- The narrow wedge is paid agent tasks where the human wants an approval step before payment.

## Submission Tracks

Primary:

- 100xDevs Frontier Hackathon Track.

Secondary:

- SagaPad, framed as agentic work infrastructure for builders and hackathon teams.
- Zerion, Covalent, or Dune if the UI visibly shows agent-used data-provider evidence.

Optional:

- Tether or payments tracks if the demo emphasizes USDC/USDT payouts.
- LPAgent only if there is a simple way to show their agent/API story without risking core delivery.

## Architecture

Use a static React app plus one native Anchor program.

Recommended stack:

- Vite.
- React.
- TypeScript.
- React Router.
- lucide-react.
- Plain CSS with CSS variables.
- localStorage persistence.
- Anchor program for task escrow.
- Anchor TypeScript client.
- Wallet adapter or wallet-standard-compatible Phantom flow.
- Devnet RPC.

The app has four layers:

- Onchain settlement: Anchor task escrow program on devnet.
- Frontend state: local persisted task UI state and cached receipts.
- Evidence layer: mocked or optional provider output showing how the agent produced its deliverable.
- Proof layer: receipt hashes tied to onchain task accounts and release transactions.

## Native Anchor Program

The smart contract should be intentionally small: SOL escrow for one paid agent task.

Program name:

- `agentpay_escrow`

Core idea:

- A payer creates a task escrow account.
- The payer funds the escrow PDA with SOL.
- The frontend runs the agent offchain and generates a deliverable hash.
- The payer approves the deliverable hash onchain.
- The payer releases escrowed SOL to the agent.
- The program stores the final receipt hash.

### Program State

```rust
#[account]
pub struct TaskEscrow {
    pub payer: Pubkey,
    pub agent: Pubkey,
    pub task_id: [u8; 16],
    pub task_hash: [u8; 32],
    pub deliverable_hash: [u8; 32],
    pub receipt_hash: [u8; 32],
    pub amount_lamports: u64,
    pub status: TaskStatus,
    pub created_at: i64,
    pub funded_at: i64,
    pub approved_at: i64,
    pub paid_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum TaskStatus {
    Created,
    Funded,
    Approved,
    Paid,
    Cancelled,
}
```

Use fixed-size hashes onchain. Keep long title, description, provider output, and JSON deliverables offchain in frontend/local state. The onchain account stores hashes and payment state.

### PDA Design

Task escrow PDA:

```txt
["task", payer_pubkey, task_id]
```

This keeps tasks deterministic for a payer while allowing multiple tasks.

### Instructions

#### `create_task`

Inputs:

- `task_id: [u8; 16]`
- `task_hash: [u8; 32]`
- `agent: Pubkey`
- `amount_lamports: u64`

Behavior:

- Initializes `TaskEscrow`.
- Stores payer, agent, task hash, amount, created timestamp.
- Sets status to `Created`.

Accounts:

- `payer` signer, mutable.
- `task_escrow` PDA init, mutable.
- `system_program`.

#### `fund_task`

Inputs:

- none.

Behavior:

- Requires status `Created`.
- Transfers `amount_lamports` from payer to `task_escrow`.
- Sets status to `Funded`.
- Sets `funded_at`.

Accounts:

- `payer` signer, mutable.
- `task_escrow` PDA, mutable.
- `system_program`.

#### `approve_task`

Inputs:

- `deliverable_hash: [u8; 32]`

Behavior:

- Requires payer signer.
- Requires status `Funded`.
- Stores deliverable hash.
- Sets status to `Approved`.
- Sets `approved_at`.

Accounts:

- `payer` signer.
- `task_escrow` PDA, mutable.

#### `release_payment`

Inputs:

- `receipt_hash: [u8; 32]`

Behavior:

- Requires payer signer.
- Requires status `Approved`.
- Transfers escrowed lamports from `task_escrow` to agent, leaving enough rent if the account remains open.
- Stores receipt hash.
- Sets status to `Paid`.
- Sets `paid_at`.

Accounts:

- `payer` signer.
- `task_escrow` PDA, mutable.
- `agent` system account, mutable.
- `system_program`.

Simpler variant:

- Close the `task_escrow` account to payer after storing `Paid` is not possible if the receipt state must remain readable.
- For the hackathon, keep the account alive and transfer only `amount_lamports`.

#### `cancel_task`

Inputs:

- none.

Behavior:

- Requires payer signer.
- Allows cancellation only before approval.
- If funded, refunds escrowed amount to payer.
- Sets status to `Cancelled`.

This is useful but lower priority than the happy path.

### Program Errors

Required errors:

- `InvalidStatus`
- `UnauthorizedPayer`
- `InvalidAgent`
- `InsufficientEscrowBalance`
- `InvalidAmount`
- `HashAlreadySet`

### Program Events

Emit events for frontend/debugging:

- `TaskCreated`
- `TaskFunded`
- `TaskApproved`
- `PaymentReleased`
- `TaskCancelled`

Events are not required for correctness, but they make the demo and logs clearer.

### Anchor Project Structure

```txt
programs/
  agentpay_escrow/
    Cargo.toml
    src/
      lib.rs
Anchor.toml
tests/
  agentpay_escrow.ts
app/
  package.json
  src/
```

If using a single Vite app at repo root, keep Anchor files at the root and React code under `app/`. This avoids mixing Anchor workspace files with frontend dependencies.

Recommended final repo layout:

```txt
solana-thon/
  Anchor.toml
  Cargo.toml
  package.json
  programs/
    agentpay_escrow/
      Cargo.toml
      src/lib.rs
  tests/
    agentpay_escrow.ts
  app/
    index.html
    package.json
    src/
```

## Frontend Contract Integration

The frontend should support two modes:

- `Onchain mode`: connected wallet, devnet, calls Anchor program.
- `Demo mode`: local seeded tasks and mocked transactions for judges without a wallet.

Onchain mode should be the primary demo.

Frontend task mapping:

- `Create Task` calls `create_task`.
- `Fund Escrow` calls `fund_task`.
- `Run Agent` remains offchain.
- `Approve Payout` calls `approve_task` with deliverable hash.
- `Release Payment` calls `release_payment` with receipt hash.
- `View Receipt` reads local metadata and the onchain `TaskEscrow` account.

Add frontend fields to distinguish source:

```ts
export type SettlementMode = "onchain-anchor" | "demo-local";

export interface OnchainRefs {
  programId: string;
  cluster: "devnet" | "localnet";
  taskEscrowPda: string;
  createTx?: string;
  fundTx?: string;
  approveTx?: string;
  releaseTx?: string;
}
```

Add to `AgentTask`:

```ts
settlementMode: SettlementMode;
onchain?: OnchainRefs;
```

The receipt page should clearly show:

- Settlement mode.
- Program id.
- Task escrow PDA.
- Create/fund/approve/release transaction links.
- Onchain status read from the account if available.

## Expanded App Structure

```txt
solana-thon/
  Anchor.toml
  Cargo.toml
  package.json
  programs/
    agentpay_escrow/
      Cargo.toml
      src/
        lib.rs
  tests/
    agentpay_escrow.ts
  app/
    package.json
    index.html
    src/
      main.tsx
      App.tsx
      styles.css
      types.ts
      data/
        seed.ts
        providers.ts
      lib/
        anchorClient.ts
        pda.ts
        ids.ts
        storage.ts
        hashes.ts
        solana.ts
        demoAgent.ts
        receipts.ts
        clipboard.ts
      components/
        Shell.tsx
        StatusPill.tsx
        Timeline.tsx
        ReceiptCard.tsx
        ReceiptVerifier.tsx
        TaskForm.tsx
        TaskTable.tsx
        AgentRunPanel.tsx
        ProviderEvidence.tsx
        WalletBadge.tsx
        MetricCard.tsx
        EmptyState.tsx
      pages/
        Dashboard.tsx
        NewTask.tsx
        TaskDetail.tsx
        ReceiptPage.tsx
        VerifyPage.tsx
        SubmitPage.tsx
  public/
    screenshots/
  README.md
```

## Data Model Expansion

Keep the original `AgentTask` model, but add explicit receipt and provider evidence fields.

```ts
export type TaskStatus =
  | "draft"
  | "funded"
  | "running"
  | "delivered"
  | "approved"
  | "paid";

export type AgentProvider =
  | "Zerion"
  | "Covalent"
  | "Dune SIM"
  | "LPAgent"
  | "Demo Agent";

export type ReceiptProofMode = "demo-hash" | "devnet-memo";

export interface ProviderEvidence {
  provider: AgentProvider;
  queryLabel: string;
  sourceWallet?: string;
  observedAt: string;
  summary: string;
  rows: Array<{
    label: string;
    value: string;
    tone?: "neutral" | "good" | "warning" | "danger";
  }>;
  rawPreview?: Record<string, unknown>;
}

export interface ReceiptProof {
  mode: ReceiptProofMode;
  receiptHash: string;
  canonicalPayload: Record<string, unknown>;
  memoTx?: string;
  memoExplorerUrl?: string;
  createdAt: string;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  payerWallet: string;
  agentName: string;
  agentWallet: string;
  provider: AgentProvider;
  payoutAmount: string;
  payoutToken: "SOL" | "USDC" | "USDT";
  status: TaskStatus;
  createdAt: string;
  fundedAt?: string;
  deliveredAt?: string;
  approvedAt?: string;
  paidAt?: string;
  inputWallet?: string;
  providerEvidence?: ProviderEvidence;
  deliverableSummary?: string;
  deliverableJson?: Record<string, unknown>;
  deliverableHash?: string;
  receiptHash?: string;
  receiptProof?: ReceiptProof;
  escrowTx?: string;
  payoutTx?: string;
}
```

## Pages

### Dashboard `/`

Purpose:

Make the product feel real within the first viewport.

Required content:

- Product title.
- Short operational subline.
- Metrics for tasks, escrowed value, agents paid, receipts issued.
- Primary action: `Create Task`.
- Secondary action: `View Submission`.
- Task table.
- Featured paid receipt preview.
- Small provider strip showing `Zerion`, `Covalent`, `Dune SIM`, `LPAgent`, and `Demo Agent`.

Expanded polish:

- Add a compact activity rail showing recent state transitions.
- Add a "Demo Mode" badge so fake tx links are transparent.
- Let seeded paid task be one click away from a complete receipt page.

### New Task `/new`

Purpose:

Create a realistic work order fast.

Required fields:

- Task title.
- Description.
- Agent name.
- Agent wallet.
- Payout amount.
- Token.
- Provider.
- Wallet to analyze.

Expanded polish:

- Add preset buttons:
  - `Wallet risk report`.
  - `Treasury concentration check`.
  - `Payout compliance review`.
- Show a live receipt preview as fields change.
- Validate obvious missing values.
- Keep submit friction low.

### Task Detail `/task/:id`

Purpose:

Main demo path.

Layout:

- Left: task summary, deliverable, provider evidence, timeline.
- Right: action panel, payment details, receipt preview.

State actions:

- `draft`: `Fund Escrow`.
- `funded`: `Run Agent`.
- `running`: auto-complete after a short delay or show `Complete Run`.
- `delivered`: `Approve Payout`.
- `approved`: `Release Payment`.
- `paid`: `View Receipt`.

Expanded behavior:

- When funding, generate an escrow tx and show it immediately.
- When running, show a short progress sequence:
  - `Fetching provider data`.
  - `Scoring wallet risk`.
  - `Writing deliverable`.
- When delivered, generate provider evidence and deliverable JSON.
- When approving, generate deliverable hash.
- When releasing, generate payout tx and receipt proof.

### Receipt Page `/receipt/:id`

Purpose:

The shareable artifact judges remember.

Required sections:

- Receipt header.
- Paid status.
- Receipt hash.
- Task title.
- Payer wallet.
- Agent wallet.
- Amount.
- Provider used.
- Deliverable hash.
- Escrow tx link.
- Payout tx link.
- Timeline.
- Copy receipt link.
- Back to dashboard.

Expanded sections:

- Canonical receipt payload preview.
- Provider evidence summary.
- Verification panel:
  - `Receipt hash matches onchain task account`.
  - `Deliverable hash is stored onchain`.
  - `Payment status: paid`.
  - `Settlement mode: Anchor SOL escrow on devnet`.
  - `Task escrow PDA`.
- Demo transparency note for seeded local examples:
  - `Seeded demo receipts use local state. Wallet-created receipts settle through the Anchor devnet program.`

### Verify Page `/verify/:hash`

Purpose:

Make the receipt feel independently checkable.

Behavior:

- Search local cached tasks for the receipt hash.
- If the task has onchain refs, fetch the task escrow account and compare receipt hash.
- If found, show receipt summary and verification checks.
- If missing locally, show a clean "Receipt not found in this browser cache" message and let the user paste a task escrow PDA.

This is optional but high-value if time permits.

### Submit Page `/submit`

Purpose:

Keep the hackathon pitch in the product.

Required sections:

- 1-line pitch.
- Tracks this fits.
- What is built.
- What is demo mode.
- Production intent.
- Links placeholders for GitHub, live app, Loom, Colosseum.

Expanded polish:

- Add a `90-second demo script`.
- Add `Judge checklist`.
- Add `Why Solana`.
- Add `What we would build next`.

## Visual Direction

Use industrial payment terminal styling.

Color tokens:

- Background: `#080A0D`.
- Surface: `#11161C`.
- Elevated: `#151B22`.
- Border: `#2A323C`.
- Primary accent: `#37FF8B`.
- Secondary accent: `#FFB020`.
- Danger: `#FF5C5C`.
- Text primary: `#F4F7FA`.
- Text muted: `#8A97A6`.

Typography:

- Use a readable sans-serif for body.
- Use monospace for wallets, hashes, receipts, and tx IDs.
- Keep the dashboard dense and operational.

UI rules:

- No purple gradient AI aesthetic.
- No landing-page-only first screen.
- No oversized marketing hero.
- Cards should be restrained, rectangular, and utility-focused.
- Buttons should use icons where they clarify action.
- Receipt should feel like a serious payment artifact.
- Mobile must preserve readability for wallet addresses and hashes.

## Agent Output

The generated output should look useful and structured.

Example:

```txt
Wallet risk: Medium
Portfolio concentration: 72% in 2 assets
Recent activity: 14 swaps, 3 failed transactions, 1 new token approval
Suggested action: require manual approval before recurring payments
```

Expanded JSON:

```json
{
  "risk": "Medium",
  "portfolioConcentration": "72% in 2 assets",
  "recentActivity": {
    "swaps": 14,
    "failedTransactions": 3,
    "newTokenApprovals": 1
  },
  "recommendation": "Require manual approval before recurring payments",
  "confidence": 0.84
}
```

Provider evidence should make the app eligible for data-provider-adjacent tracks even when mocked:

```txt
Provider: Zerion
Query: Wallet portfolio and activity summary
Observed wallet: 7xKX...9pQ2
Evidence:
- Top 2 assets: 72%
- 30-day swaps: 14
- Failed tx count: 3
- New token approvals: 1
```

## Proof Strategy

Default proof is native program state plus frontend receipt data.

- Generate canonical task payload.
- Hash task payload and store `task_hash` onchain in `create_task`.
- Generate deliverable hash after agent output.
- Store deliverable hash onchain in `approve_task`.
- Generate canonical receipt payload after release.
- Store receipt hash onchain in `release_payment`.
- Show explorer links for each real devnet transaction.
- Show the task escrow PDA as the durable onchain record.

Local proof fallback:

- Seeded tasks can use demo-local mode.
- Demo-local receipts must be labeled clearly.
- Onchain-created tasks should use real transaction signatures.

Optional memo proof:

- If time remains, add a memo transaction containing the receipt hash.
- This is secondary because the Anchor account already stores the receipt hash.

## Implementation Phases

### Phase 1: Foundation

Build:

- Anchor workspace.
- `agentpay_escrow` program skeleton.
- Vite React TypeScript app under `app/`.
- Routing.
- Data model.
- Storage helpers.
- Hash and tx generators.
- Seed tasks.
- Base layout and CSS tokens.

Acceptance:

- Anchor project builds.
- App loads.
- Routes work.
- Seed tasks persist after refresh.
- Dashboard has visible task rows.

### Phase 2: Anchor Escrow Program

Build:

- `TaskEscrow` account.
- `TaskStatus` enum.
- `create_task`.
- `fund_task`.
- `approve_task`.
- `release_payment`.
- Optional `cancel_task`.
- Program errors.
- Basic events.
- Anchor tests for happy path and invalid status transitions.

Acceptance:

- `anchor test` passes locally.
- A task can be created, funded, approved, and paid in tests.
- Invalid release before approval fails.
- Non-payer approval fails.

### Phase 3: Frontend Contract Client

Build:

- Wallet connection.
- Devnet cluster config.
- Anchor provider/client setup.
- PDA derivation helper.
- Transaction link helpers.
- Onchain account fetch helper.

Acceptance:

- Wallet connects.
- App derives task PDA.
- App can call `create_task` on devnet or localnet.
- Task account can be fetched and rendered.

### Phase 4: Core Workflow UI

Build:

- Dashboard.
- New task form.
- Task detail.
- Onchain status transitions.
- Demo-local fallback transitions.
- Timeline.
- Demo agent output.

Acceptance:

- Create task.
- Move onchain task from created to paid.
- Refresh preserves status.
- Deliverable appears before approval.
- Explorer links appear for real transactions.

### Phase 5: Receipt System

Build:

- Receipt page.
- Receipt card component.
- Canonical payload generation.
- Receipt hash generation.
- Copy link.
- Explorer links.
- Onchain account verification display.

Acceptance:

- Paid task has a shareable receipt route.
- Receipt survives refresh.
- Hashes and tx links are visible.
- Receipt hash matches the onchain account.

### Phase 6: Provider Evidence

Build:

- Provider evidence data generator.
- Provider evidence component.
- Dashboard provider strip.
- Receipt provider summary.

Acceptance:

- Demo clearly shows the agent used onchain-data-style provider output.
- Seed examples include at least one Zerion or Covalent task.

### Phase 7: Verification Polish

Build:

- Receipt verifier component.
- Optional `/verify/:hash` page.
- Verification checks on receipt page.
- Onchain proof explanation.

Acceptance:

- Receipt page explains exactly what is verified.
- Prototype limitations are clear, with onchain SOL escrow distinguished from demo-local seed data.

### Phase 8: Submission Polish

Build:

- Submit page.
- README.
- Screenshot assets if time permits.
- Final styling pass.
- Responsive pass.

Acceptance:

- README explains problem, solution, demo flow, tracks, and prototype notes.
- Submit page includes pitch and Loom script.
- Mobile viewport has no overlapping wallet or hash text.

### Phase 9: Optional SPL Token Escrow

Build only if everything above is complete:

- SPL token vault PDA.
- USDC/USDT mint config for devnet.
- Token account creation helpers.
- Token release path.

Acceptance:

- SOL escrow remains stable.
- Token escrow works in tests before appearing in UI.

## Suggested Time Budget

For an expanded build window of 10-14 hours:

- 60 min: Anchor workspace and Vite app scaffold.
- 120 min: Anchor SOL escrow program and tests.
- 90 min: wallet/client integration.
- 90 min: dashboard, form, task detail workflow.
- 75 min: receipt page and onchain verification.
- 60 min: provider evidence and demo agent polish.
- 75 min: visual styling and responsive pass.
- 45 min: submit page and README.
- 60 min: devnet deploy and bug fixing.
- 30-60 min: screenshots, deploy, Loom.
- Optional 2-3 hours: SPL token escrow.

If the window is closer to 6-8 hours, keep Anchor but skip:

- `/verify/:hash`.
- SPL token escrow.
- Memo proof.
- Screenshots in README.
- Live receipt preview on new task form.

## Manual Test Checklist

- App loads at `/`.
- Seed tasks appear.
- Dashboard metrics calculate correctly.
- Create task with default values.
- New task appears on dashboard.
- Task detail opens from dashboard.
- Wallet connects on devnet.
- `Create Task` creates an onchain task account.
- `Fund Escrow` sends a real transaction and changes status to `funded`.
- Refresh preserves `funded`.
- `Run Agent` creates provider evidence and deliverable.
- `Approve Payout` stores deliverable hash onchain.
- `Release Payment` sends SOL to the agent and stores receipt hash onchain.
- Receipt page opens.
- Receipt page survives refresh.
- Copy receipt link works.
- Explorer links open real devnet transactions in a new tab.
- Verify panel shows expected checks.
- Submit page has pitch and links.
- Mobile viewport does not overlap text.
- Long wallet and hash strings wrap cleanly.
- README run instructions work from fresh install.
- `anchor test` passes.

## Production Roadmap

After hackathon submission:

- Harden the Anchor escrow program.
- SPL Token settlement for USDC and USDT.
- Account closing and rent reclamation strategy.
- Receipt attestation account or memo-based proof standard.
- Wallet-authenticated task creation.
- Agent registry.
- Webhook/API for agent systems.
- Dispute and revision flows.
- Backend database for cross-device receipts.
- Real data-provider integrations.
- Private receipts for sensitive work.

## Final Recommendation

Build the expanded version in this order:

1. Anchor SOL escrow program.
2. Frontend wallet and contract client.
3. Task workflow UI.
4. Receipt artifact with onchain verification.
5. Provider evidence.
6. Submission polish.
7. Optional SPL token escrow.

The strongest submission will not be the broadest one. It will be the one where a judge immediately understands the paid-agent workflow, sees real SOL escrow on devnet, opens a polished receipt, and believes this can become production Solana payment infrastructure.
