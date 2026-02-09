// TransactionForm.tsx
import { useState } from "react";
import API from "../api/api";
import { DollarSign, AlertCircle, ChevronDown, Wallet } from "lucide-react";

interface Props {
    walletId: number;
    refreshAll: () => void;
    currentBalance?: number;
}

export default function TransactionForm({ walletId, refreshAll, currentBalance = 0 }: Props) {
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transactionType, setTransactionType] = useState<"topup" | "purchase">("topup");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const transactionOptions = [
        { value: "topup", label: "Add Funds", icon: "➕", color: "positive" },
        { value: "purchase", label: "Make Purchase", icon: "➖", color: "negative" }
    ];

    const selectedOption = transactionOptions.find(opt => opt.value === transactionType);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const value = parseFloat(amount);

        if (!value || value <= 0) {
            setError("Please enter a valid amount greater than 0");
            return;
        }

        if (transactionType === "topup" && value > 10000) {
            setError("Top-up amount cannot exceed $10,000");
            return;
        }

        if (transactionType === "purchase" && value > currentBalance) {
            setError(`Insufficient funds. Your current balance is $${currentBalance.toFixed(2)}`);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await API.post("/wallet/transaction", {
                walletId,
                amount: value,
                type: transactionType,
                idempotencyKey: crypto.randomUUID(),
            });

            setAmount("");
            refreshAll();

            // Show success message
            setTimeout(() => {
                setError(null);
            }, 3000);

        } catch (error: any) {
            // Handle specific backend errors
            const backendError = error.response?.data?.msg;
            if (backendError === "Insufficient funds") {
                setError(`Transaction failed: Insufficient funds. Current balance: $${currentBalance.toFixed(2)}`);
            } else if (backendError === "Invalid request data") {
                setError("Invalid transaction data. Please check the amount and try again.");
            } else if (error.response?.status === 400) {
                setError(backendError || "Transaction failed. Please try again.");
            } else if (error.response?.status === 429) {
                setError("Too many requests. Please wait a moment before trying again.");
            } else if (error.response?.status === 500) {
                setError("Server error. Please try again later.");
            } else if (!error.response) {
                setError("Network error. Please check your connection.");
            } else {
                setError("Transaction failed. Please try again.");
            }
            console.error("Transaction error:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount(value);
        setError(null); // Clear error when user starts typing
    };

    const handleTypeChange = (type: "topup" | "purchase") => {
        setTransactionType(type);
        setIsDropdownOpen(false);
        setError(null); // Clear error when type changes
    };

    const getSubmitButtonText = () => {
        if (isSubmitting) {
            return "Processing...";
        }
        return transactionType === "topup"
            ? `Add $${amount || "0.00"}`
            : `Spend $${amount || "0.00"}`;
    };

    return (
        <div className="card">
            <div className="card-header">
                <Wallet size={20} />
                <h3>New Transaction</h3>
            </div>

            <div className="card-content">
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className={`message-banner ${error.includes("success") ? 'success' : 'error'}`}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="transaction-type">
                                Transaction Type
                            </label>
                            <div className="dropdown-container">
                                <button
                                    type="button"
                                    className="dropdown-trigger"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    disabled={isSubmitting}
                                >
                                    <span className="dropdown-selection">
                                        <span className={`type-indicator ${selectedOption?.color}`}>
                                            {selectedOption?.icon}
                                        </span>
                                        {selectedOption?.label}
                                    </span>
                                    <ChevronDown size={18} className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <div className="dropdown-menu">
                                        {transactionOptions.map((option) => (
                                            <div
                                                key={option.value}
                                                className={`dropdown-item ${transactionType === option.value ? 'active' : ''}`}
                                                onClick={() => handleTypeChange(option.value as "topup" | "purchase")}
                                            >
                                                <span className={`type-indicator ${option.color}`}>
                                                    {option.icon}
                                                </span>
                                                {option.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="amount">
                                Amount (USD)
                            </label>
                            <div className="input-with-prefix">
                                <span className="input-prefix">
                                    <DollarSign size={18} />
                                </span>
                                <input
                                    id="amount"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    placeholder="0.00"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={transactionType === "topup" ? "10000" : undefined}
                                    disabled={isSubmitting}
                                    className="amount-input"
                                    required
                                />
                            </div>
                            <div className="input-hints">
                                {transactionType === "topup" && (
                                    <span className="hint">Maximum: $10,000</span>
                                )}
                                {transactionType === "purchase" && currentBalance > 0 && (
                                    <span className="hint">
                                        Available: ${currentBalance.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="transaction-summary">
                        <div className="summary-row">
                            <span>Type:</span>
                            <span className={`summary-value ${selectedOption?.color}`}>
                                {selectedOption?.label}
                            </span>
                        </div>
                        <div className="summary-row">
                            <span>Amount:</span>
                            <span className="summary-value">
                                ${amount || "0.00"}
                            </span>
                        </div>
                        {transactionType === "purchase" && amount && currentBalance > 0 && (
                            <div className="summary-row">
                                <span>New Balance:</span>
                                <span className={`summary-value ${(currentBalance - parseFloat(amount)) < 0 ? 'negative' : ''
                                    }`}>
                                    ${(currentBalance - parseFloat(amount)).toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!amount || isSubmitting}
                        className={`submit-btn ${transactionType} ${isSubmitting ? 'submitting' : ''}`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner"></div>
                                Processing...
                            </>
                        ) : (
                            getSubmitButtonText()
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}