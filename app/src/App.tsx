import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { Shell } from "./components/Shell";
import { loadTasks, saveTasks } from "./lib/storage";
import { RPC_ENDPOINT } from "./lib/solana";
import { Dashboard } from "./pages/Dashboard";
import { NewTask } from "./pages/NewTask";
import { ReceiptPage } from "./pages/ReceiptPage";
import { SubmitPage } from "./pages/SubmitPage";
import { TaskDetail } from "./pages/TaskDetail";
import { VerifyPage } from "./pages/VerifyPage";
import type { AgentTask } from "./types";
import "./styles.css";

function App() {
  const [tasks, setTasks] = useState<AgentTask[]>(() => loadTasks());
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  function addTask(task: AgentTask) {
    setTasks((current) => [task, ...current]);
  }

  function updateTask(task: AgentTask) {
    setTasks((current) => current.map((item) => (item.id === task.id ? task : item)));
  }

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <Shell>
              <Routes>
                <Route path="/" element={<Dashboard tasks={tasks} />} />
                <Route path="/new" element={<NewTask onCreate={addTask} />} />
                <Route path="/task/:id" element={<TaskDetail tasks={tasks} updateTask={updateTask} />} />
                <Route path="/receipt/:id" element={<ReceiptPage tasks={tasks} />} />
                <Route path="/verify/:hash" element={<VerifyPage tasks={tasks} />} />
                <Route path="/submit" element={<SubmitPage />} />
              </Routes>
            </Shell>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
