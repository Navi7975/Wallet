"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ledger = exports.Transaction = exports.Wallet = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Wallet_1 = __importDefault(require("./Wallet"));
exports.Wallet = Wallet_1.default;
const Transaction_1 = __importDefault(require("./Transaction"));
exports.Transaction = Transaction_1.default;
const Ledger_1 = __importDefault(require("./Ledger"));
exports.Ledger = Ledger_1.default;
// User-Wallet relationship (One-to-Many)
User_1.default.hasMany(Wallet_1.default, {
    foreignKey: "userId",
    as: "wallets" // Optional alias for easier queries
});
Wallet_1.default.belongsTo(User_1.default, {
    foreignKey: "userId",
    as: "user" // Optional alias
});
// Wallet-Ledger relationship (One-to-Many)
Wallet_1.default.hasMany(Ledger_1.default, {
    foreignKey: "walletId",
    as: "ledgerEntries" // Optional alias
});
Ledger_1.default.belongsTo(Wallet_1.default, {
    foreignKey: "walletId",
    as: "wallet" // Optional alias
});
// Transaction-Ledger relationship (One-to-Many)
Transaction_1.default.hasMany(Ledger_1.default, {
    foreignKey: "transactionId",
    as: "ledgerEntries" // Optional alias
});
Ledger_1.default.belongsTo(Transaction_1.default, {
    foreignKey: "transactionId",
    as: "transaction" // Optional alias
});
