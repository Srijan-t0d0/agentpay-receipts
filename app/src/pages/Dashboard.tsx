import { Link } from "react-router-dom";
import { ArrowRight, Bot, CheckCircle2, Coins, Receipt } from "lucide-react";
import type { AgentTask } from "../types";
import { ReceiptCard } from "../components/ReceiptCard";
import { TaskTable } from "../components/TaskTable";

export function Dashboard({ tasks }: { tasks: AgentTask[] }) {
  const receipts = tasks.filter((task) => task.status === "paid").length;
  const escrowed = tasks
    .filter((task) => task.status !== "paid" && task.status !== "cancelled")
    .reduce((sum, task) => sum + Number(task.payoutAmount || 0), 0);
  const featured = tasks.find((task) => task.status === "paid") ?? tasks[0];

  return (
    <div className="page">
      <section className="dashboard-hero">
        <div>
          <div className="eyebrow">Solana devnet escrow for paid agent work</div>
          <h1>AgentPay Receipts</h1>
          <p>Escrow-style payments and verifiable receipts for AI/API agents on Solana.</p>
        </div>
        <Link to="/new" className="primary-action">
          Create Task <ArrowRight size={18} />
        </Link>
      </section>

      <section className="metrics">
        <Metric icon={<Bot />} label="Total Tasks" value={tasks.length} />
        <Metric icon={<Coins />} label="Escrowed Value" value={`${escrowed.toFixed(2)} SOL`} />
        <Metric icon={<CheckCircle2 />} label="Agents Paid" value={receipts} />
        <Metric icon={<Receipt />} label="Receipts Issued" value={receipts} />
      </section>

      <section className="split">
        <div className="panel">
          <div className="panel-heading">
            <h2>Work Orders</h2>
            <span className="chip">Anchor + demo seeds</span>
          </div>
          <TaskTable tasks={tasks} />
        </div>
        {featured ? <ReceiptCard task={featured} /> : null}
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
