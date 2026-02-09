// WalletDashboard.tsx
import { useState } from "react";
import WalletSelector from "../components/WalletSelector";
import BalanceCard from "../components/BalanceCard";
import TransactionForm from "../components/TransactionForm";
import HistoryList from "../components/HistoryList";
import type { Wallet, LedgerEntry } from "../types/types";
import API from "../api/api";
import { CreditCard, RefreshCw } from "lucide-react";

export default function WalletDashboard() {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [walletId, setWalletId] = useState<number | null>(null);
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState<LedgerEntry[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    async function refreshAll(id = walletId) {
        if (!id) return;

        setIsRefreshing(true);
        try {
            const [balRes, histRes] = await Promise.all([
                API.get(`/wallet/${id}/balance`),
                API.get(`/wallet/${id}/history`),
            ]);

            setBalance(balRes.data.balance);
            setHistory(histRes.data);
        } catch (error) {
            console.error("Failed to refresh data:", error);
        } finally {
            setIsRefreshing(false);
        }
    }

    const selectedWallet = wallets.find(w => w.id === walletId);

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <CreditCard size={32} />
                <div>
                    <h1>Wallet Manager</h1>
                    <p>Manage your wallet balance and transactions</p>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="sidebar">
                    <WalletSelector
                        wallets={wallets}
                        setWallets={setWallets}
                        setWalletId={(id) => {
                            setWalletId(id);
                            refreshAll(id);
                        }}
                    />
                </div>

                <div className="main-content">
                    {/* Project Highlight */}
                    <a
                        href="https://github.com/Navi7975/Wallet.git"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-highlight"
                    >
                        <div className="project-card">
                            <span className="project-badge">PROJECT</span>
                            <h3>Wallet Management System</h3>
                            <p>View full source code on GitHub</p>
                            <span className="project-link">github.com/Navi7975/Wallet</span>
                        </div>
                    </a>

                    {walletId ? (
                        <>
                            <div className="dashboard-header-row">
                                <div>
                                    <h2>Wallet #{walletId}</h2>
                                    {selectedWallet && (
                                        <p className="wallet-subtitle">
                                            User ID: {selectedWallet.userId}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={() => refreshAll()}
                                    disabled={isRefreshing}
                                    className="refresh-all-btn"
                                >
                                    <RefreshCw size={18} className={isRefreshing ? 'spin' : ''} />
                                    Refresh All
                                </button>
                            </div>

                            <div className="dashboard-grid">
                                <div className="grid-col-2">
                                    <BalanceCard
                                        walletId={walletId}
                                        balance={balance}
                                        setBalance={setBalance}
                                    />

                                    <TransactionForm
                                        walletId={walletId}
                                        refreshAll={() => refreshAll()}
                                    />
                                </div>

                                <div className="grid-col-full">
                                    <HistoryList
                                        walletId={walletId}
                                        history={history}
                                        setHistory={setHistory}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="empty-dashboard">
                            <CreditCard size={64} />
                            <h3>Select a Wallet</h3>
                            <p>Choose a wallet from the sidebar to view details and make transactions</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}