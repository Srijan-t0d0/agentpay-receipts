export function SubmitPage() {
  return (
    <div className="page">
      <div className="panel">
        <div className="eyebrow">Hackathon submission brief</div>
        <h1>AgentPay Receipts</h1>
        <p className="lead">Escrow-style payments and verifiable receipts for AI/API agents on Solana.</p>
      </div>
      <div className="panel">
        <h2>Submission Links</h2>
        <div className="submission-grid">
          <a href="https://github.com/your-org/agentpay-receipts" target="_blank" rel="noreferrer">GitHub placeholder</a>
          <a href="https://agentpay-receipts.vercel.app" target="_blank" rel="noreferrer">Live app placeholder</a>
          <a href="https://www.loom.com/share/agentpay-receipts-demo" target="_blank" rel="noreferrer">Loom placeholder</a>
          <a href="https://www.colosseum.org/" target="_blank" rel="noreferrer">Colosseum placeholder</a>
        </div>
      </div>
      <div className="panel">
        <h2>Tracks</h2>
        <ul className="plain-list">
          <li>100xDevs Frontier Hackathon Track</li>
          <li>SagaPad agentic skills and founder tooling</li>
          <li>Zerion/Covalent/Dune-style provider evidence track</li>
        </ul>
      </div>
      <div className="panel">
        <h2>What Is Built</h2>
        <p>
          A React app plus native Anchor SOL escrow program. Users create paid agent tasks, fund escrow, run an offchain agent, approve the deliverable hash, release SOL, and open a public receipt.
        </p>
      </div>
      <div className="panel">
        <h2>Demo Mode vs Production Intent</h2>
        <p>
          Wallet-created tasks settle through the Anchor program on devnet. Seeded examples use local demo state. Production would add SPL token escrow, backend indexing, account cleanup, and real provider integrations.
        </p>
      </div>
      <div className="panel">
        <h2>90-second Demo Script</h2>
        <ol className="plain-list">
          <li>Open the dashboard and point out the seeded paid task, provider evidence strip, and state rail.</li>
          <li>Create a wallet-risk task from the preset and show the live receipt preview.</li>
          <li>Connect Phantom, create the Anchor task account, and fund escrow on devnet/localnet.</li>
          <li>Run the agent, complete the short sequence, approve the deliverable hash, and release SOL.</li>
          <li>Open the receipt and `/verify/:hash` page to show local cache lookup plus onchain hash checks.</li>
        </ol>
      </div>
      <div className="panel">
        <h2>Judge Checklist</h2>
        <ul className="plain-list">
          <li>Seeded paid receipt is available immediately from the dashboard.</li>
          <li>Wallet-created tasks write task, deliverable, and receipt hashes to the Anchor escrow account.</li>
          <li>Demo-local receipts are labeled so fake tx links are not confused with settled tasks.</li>
          <li>Verifier route accepts a receipt hash and compares browser cache against the TaskEscrow account when present.</li>
        </ul>
      </div>
      <div className="panel">
        <h2>Why Solana</h2>
        <p>
          Agent payments need fast finality, low fees, public account state, and wallet-native approval. Solana makes every task account, escrow transition, and receipt hash cheap enough to use per agent job rather than only for large invoices.
        </p>
      </div>
      <div className="panel">
        <h2>What We Would Build Next</h2>
        <ul className="plain-list">
          <li>SPL token escrow for USDC and USDT payouts.</li>
          <li>Indexer-backed receipt search across wallets, agents, and receipt hashes.</li>
          <li>Real Zerion, Covalent, Dune SIM, and LPAgent API adapters.</li>
          <li>Revision, dispute, cancellation cleanup, and account close flows.</li>
        </ul>
      </div>
    </div>
  );
}
