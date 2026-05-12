import { seedTasks } from "../data/seed";
import type { AgentTask } from "../types";

const STORAGE_KEY = "agentpay.tasks.v1";

export function loadTasks(): AgentTask[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveTasks(seedTasks);
    return seedTasks;
  }

  try {
    return JSON.parse(raw) as AgentTask[];
  } catch {
    saveTasks(seedTasks);
    return seedTasks;
  }
}

export function saveTasks(tasks: AgentTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
