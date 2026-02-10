import User from "./User";
import Wallet from "./Wallet";
import Transaction from "./Transaction";
import Ledger from "./Ledger";

// User-Wallet relationship (One-to-Many)
User.hasMany(Wallet, {
    foreignKey: "userId",
    as: "wallets" // Optional alias for easier queries
});
Wallet.belongsTo(User, {
    foreignKey: "userId",
    as: "user" // Optional alias
});

// Wallet-Ledger relationship (One-to-Many)
Wallet.hasMany(Ledger, {
    foreignKey: "walletId",
    as: "ledgerEntries" // Optional alias
});
Ledger.belongsTo(Wallet, {
    foreignKey: "walletId",
    as: "wallet" // Optional alias
});

// Transaction-Ledger relationship (One-to-Many)
Transaction.hasMany(Ledger, {
    foreignKey: "transactionId",
    as: "ledgerEntries" // Optional alias
});
Ledger.belongsTo(Transaction, {
    foreignKey: "transactionId",
    as: "transaction" // Optional alias
});

export { User, Wallet, Transaction, Ledger };