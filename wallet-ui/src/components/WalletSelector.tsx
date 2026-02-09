// WalletSelector.tsx
import { useEffect, useState } from "react";
import API from "../api/api";
import type { Wallet } from "../types/types";
import { CreditCard, ChevronDown, Users, Wallet as WalletIcon } from "lucide-react";

interface Props {
    wallets: Wallet[];
    setWallets: (w: Wallet[]) => void;
    setWalletId: (id: number) => void;
}

export default function WalletSelector({ wallets, setWallets, setWalletId }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            try {
                const res = await API.get("/wallet");
                setWallets(res.data);
            } catch (error) {
                setError("Failed to load wallets");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    const filteredWallets = wallets.filter(wallet =>
        wallet.id.toString().includes(search) ||
        wallet.userId.toString().includes(search) ||
        wallet.assetType.toLowerCase().includes(search.toLowerCase())
    );

    if (error) {
        return (
            <div className="card error-card">
                <div className="card-content">
                    <p className="error-text">{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <CreditCard className="icon" size={20} />
                <h3>Select Wallet</h3>
            </div>

            <div className="card-content">
                <div className="form-group">
                    <label htmlFor="wallet-search">
                        <Users size={16} />
                        Search Wallets
                    </label>

                    <div className="search-input">
                        <input
                            id="wallet-search"
                            type="text"
                            placeholder="Search by ID, User ID, or asset type..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="wallet-list">
                        {isLoading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <span>Loading wallets...</span>
                            </div>
                        ) : filteredWallets.length === 0 ? (
                            <div className="empty-state">
                                <WalletIcon size={32} />
                                <p>No wallets found</p>
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="text-btn"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {filteredWallets.map((wallet) => (
                                    <div
                                        key={wallet.id}
                                        className="wallet-item"
                                        onClick={() => setWalletId(wallet.id)}
                                    >
                                        <div className="wallet-icon">
                                            <WalletIcon size={20} />
                                        </div>
                                        <div className="wallet-info">
                                            <div className="wallet-name">
                                                Wallet #{wallet.id}
                                                {wallet.assetType && (
                                                    <span className="asset-tag">{wallet.assetType}</span>
                                                )}
                                            </div>
                                            <div className="wallet-details">
                                                User ID: {wallet.userId}
                                            </div>
                                        </div>
                                        <ChevronDown className="select-arrow" size={20} />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {wallets.length > 0 && (
                        <div className="wallet-stats">
                            <span>{filteredWallets.length} of {wallets.length} wallets shown</span>
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="text-btn"
                                >
                                    Clear filter
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}