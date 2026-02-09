// HistoryList.tsx
import API from "../api/api";
import type { LedgerEntry } from "../types/types";
import {
    History,
    Download,
    TrendingUp,
    TrendingDown,
    Calendar,
    Hash,
    Filter,
    ChevronDown
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Props {
    walletId: number;
    history: LedgerEntry[];
    setHistory: (h: LedgerEntry[]) => void;
}

export default function HistoryList({ walletId, history, setHistory }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function load() {
        setIsLoading(true);
        setError(null);

        try {
            const res = await API.get(`/wallet/${walletId}/history`);
            setHistory(res.data);
        } catch (error) {
            setError("Failed to load transaction history");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const formatFullDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredHistory = history.filter(entry => {
        if (filter === 'positive') return entry.amount > 0;
        if (filter === 'negative') return entry.amount < 0;
        return true;
    });

    const totalPositive = history.reduce((sum, entry) =>
        entry.amount > 0 ? sum + entry.amount : sum, 0
    );

    const totalNegative = history.reduce((sum, entry) =>
        entry.amount < 0 ? sum + Math.abs(entry.amount) : sum, 0
    );

    const getFilterLabel = () => {
        switch (filter) {
            case 'all': return 'All Transactions';
            case 'positive': return 'Top-ups Only';
            case 'negative': return 'Purchases Only';
            default: return 'Filter';
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <History className="icon" size={20} />
                <h3>Transaction History</h3>
                <div className="header-actions">
                    <div className="dropdown-container" ref={dropdownRef}>
                        <button
                            className="dropdown-trigger"
                            onClick={() => setShowDropdown(!showDropdown)}
                            aria-expanded={showDropdown}
                            aria-haspopup="true"
                        >
                            <div className="dropdown-selection">
                                <Filter size={16} />
                                <span>{getFilterLabel()}</span>
                            </div>
                            <ChevronDown
                                size={16}
                                className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
                            />
                        </button>

                        {showDropdown && (
                            <div className="dropdown-menu">
                                <div
                                    className={`dropdown-item ${filter === 'all' ? 'active' : ''}`}
                                    onClick={() => {
                                        setFilter('all');
                                        setShowDropdown(false);
                                    }}
                                >
                                    <div className="type-indicator">
                                        <History size={16} />
                                    </div>
                                    <div>
                                        <div className="dropdown-item-label">All Transactions</div>
                                        <div className="dropdown-item-description">
                                            Show all transactions
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`dropdown-item ${filter === 'positive' ? 'active' : ''}`}
                                    onClick={() => {
                                        setFilter('positive');
                                        setShowDropdown(false);
                                    }}
                                >
                                    <div className="type-indicator positive">
                                        <TrendingUp size={16} />
                                    </div>
                                    <div>
                                        <div className="dropdown-item-label">Top-ups Only</div>
                                        <div className="dropdown-item-description">
                                            Only show money added
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`dropdown-item ${filter === 'negative' ? 'active' : ''}`}
                                    onClick={() => {
                                        setFilter('negative');
                                        setShowDropdown(false);
                                    }}
                                >
                                    <div className="type-indicator negative">
                                        <TrendingDown size={16} />
                                    </div>
                                    <div>
                                        <div className="dropdown-item-label">Purchases Only</div>
                                        <div className="dropdown-item-description">
                                            Only show money spent
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card-content">
                <div className="history-summary">
                    <div className="summary-item positive">
                        <TrendingUp size={16} />
                        <span className="summary-label">Total Added:</span>
                        <span className="summary-value">+${totalPositive.toFixed(2)}</span>
                    </div>
                    <div className="summary-item negative">
                        <TrendingDown size={16} />
                        <span className="summary-label">Total Spent:</span>
                        <span className="summary-value">-${totalNegative.toFixed(2)}</span>
                    </div>
                </div>

                <div className="history-controls">
                    <button
                        onClick={load}
                        disabled={isLoading}
                        className="load-btn"
                    >
                        <Download size={16} />
                        {isLoading ? 'Loading...' : 'Refresh History'}
                    </button>

                    {history.length > 0 && (
                        <div className="history-stats">
                            Showing {filteredHistory.length} of {history.length} transactions
                        </div>
                    )}
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {filteredHistory.length > 0 ? (
                    <div className="transaction-list">
                        {filteredHistory.map((entry) => (
                            <div key={entry.id} className="transaction-item">
                                <div className="transaction-icon">
                                    {entry.amount > 0 ? (
                                        <div className="icon-circle positive">
                                            <TrendingUp size={16} />
                                        </div>
                                    ) : (
                                        <div className="icon-circle negative">
                                            <TrendingDown size={16} />
                                        </div>
                                    )}
                                </div>

                                <div className="transaction-details">
                                    <div className="transaction-info">
                                        <span className="transaction-type">
                                            {entry.amount > 0 ? 'Top-up' : 'Purchase'}
                                        </span>
                                        <span className="transaction-id">
                                            <Hash size={12} />
                                            TX-{entry.transactionId.toString().padStart(4, '0')}
                                        </span>
                                    </div>
                                    <div className="transaction-meta">
                                        <span className="transaction-date">
                                            <Calendar size={12} />
                                            {formatFullDate(entry.createdAt)}
                                        </span>
                                        <span className="transaction-wallet">
                                            Wallet #{entry.walletId}
                                        </span>
                                    </div>
                                </div>

                                <div className={`transaction-amount ${entry.amount > 0 ? 'positive' : 'negative'}`}>
                                    <span className="amount-sign">{entry.amount > 0 ? '+' : '−'}</span>
                                    <span className="amount-value">${Math.abs(entry.amount).toFixed(2)}</span>
                                    <div className="time-ago">{formatDate(entry.createdAt)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <History size={48} />
                        {history.length === 0 ? (
                            <>
                                <p>No transactions recorded</p>
                                <button onClick={load} className="text-btn">
                                    Load transaction history
                                </button>
                            </>
                        ) : (
                            <>
                                <p>No transactions match the current filter</p>
                                <button onClick={() => setFilter('all')} className="text-btn">
                                    Show all transactions
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}