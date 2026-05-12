import { CheckCircle2, Circle } from "lucide-react";
import type { AgentTask } from "../types";

export function Timeline({ task }: { task: AgentTask }) {
  const items = [
    ["Created", task.createdAt],
    ["Funded", task.fundedAt],
    ["Delivered", task.deliveredAt],
    ["Approved", task.approvedAt],
    ["Paid", task.paidAt],
  ];

  return (
    <div className="timeline">
      {items.map(([label, value]) => (
        <div className="timeline-item" key={label}>
          {value ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          <div>
            <strong>{label}</strong>
            <span>{value ? new Date(value).toLocaleString() : "Pending"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
