import { Link, NavLink } from "react-router-dom";
import { Bot, FileText, Plus, Receipt, Wallet } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletBadge } from "./WalletBadge";
import "@solana/wallet-adapter-react-ui/styles.css";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <Bot size={22} />
          <span>AgentPay Receipts</span>
        </Link>
        <nav>
          <NavLink to="/">
            <Receipt size={16} /> Dashboard
          </NavLink>
          <NavLink to="/new">
            <Plus size={16} /> Create
          </NavLink>
          <NavLink to="/submit">
            <FileText size={16} /> Submit
          </NavLink>
        </nav>
        <div className="wallet-wrap">
          <WalletBadge />
          <Wallet size={16} />
          <WalletMultiButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
