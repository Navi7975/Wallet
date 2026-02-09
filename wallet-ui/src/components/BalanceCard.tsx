// BalanceCard.tsx
import API from "../api/api";
import { RefreshCw, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface Props {
    walletId: number;
    balance: number;
    setBalance: (b: number) => void;
}

export default function BalanceCard({ walletId, balance, setBalance }: Props) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [balanceHistory, setBalanceHistory] = useState<number[]>([balance]);

    async function refresh() {
        setIsRefreshing(true);
        try {
            const res = await API.get(`/wallet/${walletId}/balance`);
            const newBalance = res.data.balance;
            setBalance(newBalance);
            setBalanceHistory(prev => [...prev.slice(-4), newBalance]); // Keep last 5 balances
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to refresh balance:", error);
        } finally {
            setIsRefreshing(false);
        }
    }

    const getBalanceChange = () => {
        if (balanceHistory.length < 2) return null;
        const previous = balanceHistory[balanceHistory.length - 2];
        const change = balance - previous;
        return change;
    };

    const balanceChange = getBalanceChange();

    return (
        <div className="card">
            <div className="card-header">
                <Wallet className="icon" size={20} />
                <h3>Balance Overview</h3>
            </div>

            <div className="card-content">
                <div className="balance-display">
                    <div className="balance-main">
                        <span className="balance-amount">
                            ${balance.toFixed(2)}
                        </span>
                        <span className="balance-label">Current Balance</span>
                    </div>

                    {balanceChange !== null && balanceChange !== 0 && (
                        <div className={`balance-change ${balanceChange > 0 ? 'positive' : 'negative'}`}>
                            {balanceChange > 0 ? (
                                <TrendingUp size={16} />
                            ) : (
                                <TrendingDown size={16} />
                            )}
                            <span>
                                {balanceChange > 0 ? '+' : ''}{balanceChange.toFixed(2)}
                            </span>
                            <span className="change-label">since last refresh</span>
                        </div>
                    )}
                </div>

                <div className="balance-history">
                    <div className="history-label">Recent balance history:</div>
                    <div className="history-bars">
                        {balanceHistory.map((bal, index) => (
                            <div key={index} className="history-bar-container">
                                <div
                                    className="history-bar"
                                    style={{
                                        height: `${Math.min(50, (bal / Math.max(...balanceHistory)) * 50)}px`
                                    }}
                                />
                                <span className="history-value">${bal.toFixed(0)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-footer">
                    <button
                        onClick={refresh}
                        disabled={isRefreshing}
                        className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
                    >
                        <RefreshCw size={16} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh Balance'}
                    </button>

                    {lastUpdated && (
                        <span className="timestamp">
                            Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}