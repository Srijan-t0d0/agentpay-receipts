import type { ProviderEvidence as Evidence } from "../types";

export function ProviderEvidence({ evidence }: { evidence?: Evidence }) {
  if (!evidence) {
    return (
      <div className="panel muted-panel">
        <h3>Provider Evidence</h3>
        <p>No provider output yet. Run the agent to generate onchain-data-style evidence.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-heading">
        <h3>Provider Evidence</h3>
        <span className="chip">{evidence.provider}</span>
      </div>
      <p className="muted">{evidence.summary}</p>
      <div className="evidence-grid">
        {evidence.rows.map((row) => (
          <div className={`evidence-row tone-${row.tone ?? "neutral"}`} key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
