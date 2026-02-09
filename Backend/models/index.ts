import User from "./User";
import Wallet from "./Wallet";
import Transaction from "./Transaction";
import Ledger from "./Ledger";

User.hasMany(Wallet, { foreignKey: "userId" });
Wallet.belongsTo(User, { foreignKey: "userId" });

Wallet.hasMany(Ledger, { foreignKey: "walletId" });
Ledger.belongsTo(Wallet, { foreignKey: "walletId" });

Transaction.hasMany(Ledger, { foreignKey: "transactionId" });
Ledger.belongsTo(Transaction, { foreignKey: "transactionId" });

export { User, Wallet, Transaction, Ledger };
