export function SubmitPage() {
  return (
    <div className="page narrow">
      <div className="panel">
        <div className="eyebrow">Hackathon submission brief</div>
        <h1>AgentPay Receipts</h1>
        <p className="lead">Escrow-style payments and verifiable receipts for AI/API agents on Solana.</p>
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
        <h2>Loom Script</h2>
        <p>
          AgentPay Receipts solves payment accountability for AI agents. I create a paid wallet-risk task, fund SOL escrow, run an agent with provider-style evidence, approve the output, release payment, and show the public receipt with hashes and devnet transaction links.
        </p>
      </div>
    </div>
  );
}
