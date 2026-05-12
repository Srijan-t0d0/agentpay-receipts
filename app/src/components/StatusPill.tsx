import type { TaskStatus } from "../types";

const labels: Record<TaskStatus, string> = {
  draft: "Draft",
  created: "Created",
  funded: "Funded",
  running: "Running",
  delivered: "Delivered",
  approved: "Approved",
  paid: "Paid",
  cancelled: "Cancelled",
};

export function StatusPill({ status }: { status: TaskStatus }) {
  return <span className={`status status-${status}`}>{labels[status]}</span>;
}
