import { Link } from "react-router-dom";
import { ArrowRight, Bot, CheckCircle2, Coins, FileText, Receipt } from "lucide-react";
import type { AgentTask } from "../types";
import { MetricCard } from "../components/MetricCard";
import { ReceiptCard } from "../components/ReceiptCard";
import { TaskTable } from "../components/TaskTable";
import { providers, providerDescriptions } from "../data/providers";

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
        <div className="hero-actions">
          <Link to="/submit" className="secondary-action">
            View Submission <FileText size={18} />
          </Link>
          <Link to="/new" className="primary-action">
            Create Task <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="metrics">
        <MetricCard icon={<Bot />} label="Total Tasks" value={tasks.length} />
        <MetricCard icon={<Coins />} label="Escrowed Value" value={`${escrowed.toFixed(2)} SOL`} />
        <MetricCard icon={<CheckCircle2 />} label="Agents Paid" value={receipts} />
        <MetricCard icon={<Receipt />} label="Receipts Issued" value={receipts} />
      </section>

      <section className="provider-strip">
        {providers.map((provider) => (
          <div className="provider-chip" key={provider}>
            <strong>{provider}</strong>
            <span>{providerDescriptions[provider]}</span>
          </div>
        ))}
      </section>

      <section className="split">
        <div className="panel">
          <div className="panel-heading">
            <h2>Work Orders</h2>
            <div className="heading-actions">
              {featured?.settlementMode === "demo-local" ? <span className="chip demo-chip">Demo Mode</span> : null}
              <span className="chip">Anchor + demo seeds</span>
            </div>
          </div>
          <TaskTable tasks={tasks} />
        </div>
        <div className="stack">
          {featured ? (
            <>
              <Link className="seed-shortcut" to={`/receipt/${featured.id}`}>
                <Receipt size={18} />
                Seeded paid task is one click from a complete receipt page
                <ArrowRight size={16} />
              </Link>
              <ReceiptCard task={featured} />
            </>
          ) : null}
          <ActivityRail tasks={tasks} />
        </div>
      </section>
    </div>
  );
}

function ActivityRail({ tasks }: { tasks: AgentTask[] }) {
  const events = tasks
    .flatMap((task) => [
      { label: "created", at: task.createdAt, title: task.title },
      { label: "funded", at: task.fundedAt, title: task.title },
      { label: "delivered", at: task.deliveredAt, title: task.title },
      { label: "paid", at: task.paidAt, title: task.title },
    ])
    .filter((event) => event.at)
    .sort((a, b) => new Date(b.at!).getTime() - new Date(a.at!).getTime())
    .slice(0, 5);

  return (
    <div className="panel activity-rail">
      <div className="panel-heading">
        <h2>Activity</h2>
        <span className="chip">state rail</span>
      </div>
      {events.map((event) => (
        <div className="activity-item" key={`${event.title}-${event.label}-${event.at}`}>
          <span>{event.label}</span>
          <strong>{event.title}</strong>
          <small>{new Date(event.at!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
        </div>
      ))}
    </div>
  );
}
