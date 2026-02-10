// TransactionForm.tsx
import { useState } from "react";
import API from "../api/api";
import { DollarSign, AlertCircle, ChevronDown, Wallet, RefreshCw } from "lucide-react";

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
    const [debugInfo, setDebugInfo] = useState<string>("");

    const transactionOptions = [
        { value: "topup", label: "Add Funds", icon: "➕", color: "positive" },
        { value: "purchase", label: "Make Purchase", icon: "➖", color: "negative" }
    ];

    const selectedOption = transactionOptions.find(opt => opt.value === transactionType);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const value = parseFloat(amount);

        /* ---------- BASIC VALIDATION ---------- */

        if (!value || value <= 0) {
            setError("Please enter a valid amount greater than 0");
            return;
        }

        if (transactionType === "topup" && value > 10000) {
            setError("Top-up amount cannot exceed $10,000");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                walletId,
                amount: value,
                type: transactionType,
                idempotencyKey: `${transactionType}-${walletId}-${Date.now()}`
            };

            const response = await API.post("/wallet/transaction", payload);

            setAmount("");
            refreshAll();

            setError(
                ` ${transactionType === "topup" ? "Added" : "Spent"
                } $${value.toFixed(2)} successfully!`
            );

            setTimeout(() => setError(null), 3000);

        } catch (error: any) {
            const msg =
                error.response?.data?.msg ||
                error.response?.data?.message ||
                "Transaction failed";

            if (msg.toLowerCase().includes("insufficient")) {
                setError(" Insufficient funds");
            } else {
                setError(` ${msg}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    }


    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers and decimal point
        if (/^\d*\.?\d*$/.test(value)) {
            setAmount(value);
            setError(null);
            setDebugInfo("");
        }
    };

    const handleTypeChange = (type: "topup" | "purchase") => {
        setTransactionType(type);
        setIsDropdownOpen(false);
        setError(null);
        setDebugInfo("");
    };

    const getSubmitButtonText = () => {
        if (isSubmitting) {
            return transactionType === "topup" ? "Adding Funds..." : "Processing Purchase...";
        }
        return transactionType === "topup"
            ? `Add $${amount || "0.00"}`
            : `Spend $${amount || "0.00"}`;
    };

    const handleTestPurchase = async () => {
        // Test with exact Postman payload
        setIsSubmitting(true);
        setError(null);

        try {
            const testPayload = {
                walletId: 1,
                amount: 50,
                type: "purchase",
                idempotencyKey: "purchase-unique-001"
            };

            console.log("Testing with Postman payload:", testPayload);
            setDebugInfo("Testing with Postman payload...");

            const response = await API.post("/wallet/transaction", testPayload);
            console.log("Test response:", response.data);

            setError(" Test purchase successful! Check console for details.");
            refreshAll();

        } catch (err: any) {
            console.error("Test purchase failed:", err);
            setError(` Test failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <Wallet size={20} />
                <h3>New Transaction</h3>
                <button
                    onClick={handleTestPurchase}
                    className="test-button"
                    title="Test with Postman payload"
                    disabled={isSubmitting}
                >
                    <RefreshCw size={14} />
                    Test
                </button>
            </div>

            <div className="card-content">
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className={`message-banner ${error.includes("") ? 'success' : 'error'}`}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {debugInfo && (
                        <div className="debug-info">
                            <small>{debugInfo}</small>
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

                                    max={transactionType === "topup" ? 10000 : undefined}
                                    disabled={isSubmitting}
                                    className="amount-input"
                                    required
                                />

                            </div>
                            <div className="input-hints">
                                {transactionType === "topup" && (
                                    <span className="hint">Maximum: $10,000</span>
                                )}
                                {transactionType === "purchase" && (
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
                        {transactionType === "purchase" && amount && (
                            <div className="summary-row">
                                <span>New Balance:</span>
                                <span className={`summary-value ${(currentBalance - parseFloat(amount)) < 0 ? 'negative' : 'positive'}`}>
                                    ${(currentBalance - parseFloat(amount)).toFixed(2)}
                                </span>
                            </div>
                        )}
                        {transactionType === "topup" && amount && (
                            <div className="summary-row">
                                <span>New Balance:</span>
                                <span className="summary-value positive">
                                    ${(currentBalance + parseFloat(amount)).toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!amount || isSubmitting || parseFloat(amount) <= 0}
                        className={`submit-btn ${transactionType} ${isSubmitting ? 'submitting' : ''}`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner"></div>
                                {transactionType === "topup" ? "Adding..." : "Processing..."}
                            </>
                        ) : (
                            getSubmitButtonText()
                        )}
                    </button>

                    <div className="transaction-tips">
                        <small>
                            {transactionType === "purchase" && (
                                <>
                                    💡 <strong>Purchase not working?</strong> Try entering exactly <code>50</code> and click "Test" button above.
                                </>
                            )}
                        </small>
                    </div>
                </form>
            </div>
        </div>
    );
}