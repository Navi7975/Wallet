"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWallets = exports.createTransaction = exports.getHistory = exports.getBalance = exports.createWallet = void 0;
const db_1 = __importDefault(require("../config/db"));
const models_1 = require("../models");
const withRetry_1 = require("../utils/withRetry");
const createWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, assetType } = req.body;
    const wallet = yield models_1.Wallet.create({ userId, assetType });
    res.json(wallet);
});
exports.createWallet = createWallet;
const getBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const walletId = Number(req.params.walletId);
    const balance = (yield models_1.Ledger.sum("amount", { where: { walletId } })) || 0;
    res.json({ balance });
});
exports.getBalance = getBalance;
const getHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const walletId = Number(req.params.walletId);
    const history = yield models_1.Ledger.findAll({
        where: { walletId },
        order: [["createdAt", "DESC"]],
    });
    res.json(history);
});
exports.getHistory = getHistory;
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletId, amount, type, idempotencyKey } = req.body;
    if (!walletId || !amount || amount <= 0 || !type || !idempotencyKey) {
        return res.status(400).json({ msg: "Invalid request data" });
    }
    try {
        yield (0, withRetry_1.withRetry)(() => __awaiter(void 0, void 0, void 0, function* () {
            const t = yield db_1.default.transaction();
            // 1️⃣ Idempotency check
            const existing = yield models_1.Transaction.findOne({
                where: { idempotencyKey },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (existing) {
                yield t.rollback();
                return; // silently ignore duplicate
            }
            // 2️⃣ Lock wallet
            yield models_1.Wallet.findByPk(walletId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            // 3️⃣ Current balance
            const balance = (yield models_1.Ledger.sum("amount", {
                where: { walletId },
                transaction: t,
            })) || 0;
            // 4️⃣ Decide ledger amount based on type
            const ledgerAmount = type === "purchase" ? -Math.abs(amount) : Math.abs(amount);
            // 5️⃣ Insufficient funds check
            if (ledgerAmount < 0 && balance + ledgerAmount < 0) {
                yield t.rollback();
                throw new Error("Insufficient funds");
            }
            // 6️⃣ Create transaction
            const tx = yield models_1.Transaction.create({ idempotencyKey, type }, { transaction: t });
            // 7️⃣ Create ledger entry
            yield models_1.Ledger.create({
                walletId,
                transactionId: tx.id,
                amount: ledgerAmount,
            }, { transaction: t });
            yield t.commit();
        }));
        res.json({ success: true });
    }
    catch (err) {
        res.status(400).json({ msg: err.message });
    }
});
exports.createTransaction = createTransaction;
const getWallets = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const wallets = yield models_1.Wallet.findAll();
    res.json(wallets);
});
exports.getWallets = getWallets;
