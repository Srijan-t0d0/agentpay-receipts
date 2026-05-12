import { Link } from "react-router-dom";
import type { AgentTask } from "../types";
import { shortAddress } from "../lib/solana";
import { StatusPill } from "./StatusPill";

export function TaskTable({ tasks }: { tasks: AgentTask[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Agent</th>
            <th>Provider</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>
                <Link to={`/task/${task.id}`}>{task.title}</Link>
                <small>{task.settlementMode === "onchain-anchor" ? shortAddress(task.onchain?.taskEscrowPda) : "Demo-local seed"}</small>
              </td>
              <td>{task.agentName}</td>
              <td>{task.provider}</td>
              <td>
                {task.payoutAmount} {task.payoutToken}
              </td>
              <td>
                <StatusPill status={task.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
