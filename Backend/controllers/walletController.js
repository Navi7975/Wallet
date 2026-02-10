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
/* ======================================================
   CREATE WALLET
====================================================== */
const createWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, assetType } = req.body;
    const wallet = yield models_1.Wallet.create({ userId, assetType });
    res.json(wallet);
});
exports.createWallet = createWallet;
/* ======================================================
   GET BALANCE (Ledger Source of Truth)
====================================================== */
const getBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const walletId = Number(req.params.walletId);
    const balance = (yield models_1.Ledger.sum("amount", { where: { walletId } })) || 0;
    res.json({ balance });
});
exports.getBalance = getBalance;
/* ======================================================
   GET LEDGER HISTORY
====================================================== */
const getHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const walletId = Number(req.params.walletId);
    const history = yield models_1.Ledger.findAll({
        where: { walletId },
        order: [["createdAt", "DESC"]],
    });
    res.json(history);
});
exports.getHistory = getHistory;
/* ======================================================
   CREATE TRANSACTION — FULLY FIXED
====================================================== */
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletId, amount, type, idempotencyKey } = req.body;
    const walletIdNum = Number(walletId);
    const amt = Number(amount);
    if (!walletIdNum || !amt || amt <= 0 || !type || !idempotencyKey) {
        return res.status(400).json({ msg: "Invalid request data" });
    }
    try {
        yield db_1.default.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            /* 1️⃣ Idempotency */
            const existing = yield models_1.Transaction.findOne({
                where: { idempotencyKey },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (existing)
                return;
            /* 2️⃣ Lock wallet */
            const wallet = yield models_1.Wallet.findByPk(walletIdNum, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (!wallet)
                throw new Error("Wallet not found");
            /* 3️⃣ Ledger balance */
            const balance = (yield models_1.Ledger.sum("amount", {
                where: { walletId: walletIdNum },
                transaction: t,
            })) || 0;
            /* 4️⃣ Signed amount */
            const ledgerAmount = type === "purchase"
                ? -Math.abs(amt)
                : Math.abs(amt);
            if (ledgerAmount < 0 && balance + ledgerAmount < 0) {
                throw new Error("Insufficient funds");
            }
            /* 5️⃣ Create transaction */
            const tx = yield models_1.Transaction.create({
                idempotencyKey,
                type,
                status: "completed",
            }, { transaction: t });
            const newBalance = balance + ledgerAmount;
            /* 6️⃣ Ledger entry */
            yield models_1.Ledger.create({
                walletId: walletIdNum,
                transactionId: tx.id,
                amount: ledgerAmount,
                balanceAfter: newBalance,
            }, { transaction: t });
            /* 7️⃣ Update wallet balance */
            yield wallet.update({ balance: newBalance }, { transaction: t });
        }));
        res.json({ success: true });
    }
    catch (err) {
        res.status(400).json({ msg: err.message });
    }
});
exports.createTransaction = createTransaction;
/* ======================================================
   GET ALL WALLETS
====================================================== */
const getWallets = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const wallets = yield models_1.Wallet.findAll();
    res.json(wallets);
});
exports.getWallets = getWallets;
