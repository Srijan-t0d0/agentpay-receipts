import { Link, useParams } from "react-router-dom";
import { ReceiptVerifier } from "../components/ReceiptVerifier";
import { ReceiptCard } from "../components/ReceiptCard";
import type { AgentTask } from "../types";

export function VerifyPage({ tasks }: { tasks: AgentTask[] }) {
  const { hash } = useParams();
  const task = tasks.find((item) => item.receiptHash === hash || item.id === hash || item.taskHash === hash || item.deliverableHash === hash);

  return (
    <div className="page">
      <section className="detail-head">
        <div>
          <div className="eyebrow">Receipt verification route</div>
          <h1>Verify Receipt</h1>
          <p>{hash}</p>
        </div>
        {task ? <Link className="secondary-action" to={`/receipt/${task.id}`}>Open Receipt Page</Link> : null}
      </section>
      <section className="split">
        <ReceiptVerifier hash={hash} task={task} />
        {task ? <ReceiptCard task={task} /> : <div className="panel">No local receipt matched this hash.</div>}
      </section>
    </div>
  );
}
