import { Request, Response } from "express";
import sequelize from "../config/db";
import { Wallet, Transaction, Ledger } from "../models";
import { withRetry } from "../utils/withRetry";

/* ======================================================
   CREATE WALLET
====================================================== */
export const createWallet = async (req: Request, res: Response) => {
    const { userId, assetType } = req.body;

    const wallet = await Wallet.create({ userId, assetType });

    res.json(wallet);
};

/* ======================================================
   GET BALANCE (Ledger Source of Truth)
====================================================== */
export const getBalance = async (req: Request, res: Response) => {
    const walletId = Number(req.params.walletId);

    const balance =
        (await Ledger.sum("amount", { where: { walletId } })) || 0;

    res.json({ balance });
};

/* ======================================================
   GET LEDGER HISTORY
====================================================== */
export const getHistory = async (req: Request, res: Response) => {
    const walletId = Number(req.params.walletId);

    const history = await Ledger.findAll({
        where: { walletId },
        order: [["createdAt", "DESC"]],
    });

    res.json(history);
};

/* ======================================================
   CREATE TRANSACTION — FULLY FIXED
====================================================== */
export const createTransaction = async (req: Request, res: Response) => {
    const { walletId, amount, type, idempotencyKey } = req.body;

    const walletIdNum = Number(walletId);
    const amt = Number(amount);

    if (!walletIdNum || !amt || amt <= 0 || !type || !idempotencyKey) {
        return res.status(400).json({ msg: "Invalid request data" });
    }

    try {
        await sequelize.transaction(async (t) => {

            /* 1️⃣ Idempotency */
            const existing = await Transaction.findOne({
                where: { idempotencyKey },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            if (existing) return;

            /* 2️⃣ Lock wallet */
            const wallet = await Wallet.findByPk(walletIdNum, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            if (!wallet) throw new Error("Wallet not found");

            /* 3️⃣ Ledger balance */
            const balance =
                (await Ledger.sum("amount", {
                    where: { walletId: walletIdNum },
                    transaction: t,
                })) || 0;

            /* 4️⃣ Signed amount */
            const ledgerAmount =
                type === "purchase"
                    ? -Math.abs(amt)
                    : Math.abs(amt);

            if (ledgerAmount < 0 && balance + ledgerAmount < 0) {
                throw new Error("Insufficient funds");
            }

            /* 5️⃣ Create transaction */
            const tx = await Transaction.create(
                {
                    idempotencyKey,
                    type,
                    status: "completed",
                },
                { transaction: t }
            );

            const newBalance = balance + ledgerAmount;

            /* 6️⃣ Ledger entry */
            await Ledger.create(
                {
                    walletId: walletIdNum,
                    transactionId: tx.id,
                    amount: ledgerAmount,
                    balanceAfter: newBalance,
                },
                { transaction: t }
            );

            /* 7️⃣ Update wallet balance */
            await wallet.update(
                { balance: newBalance },
                { transaction: t }
            );
        });

        res.json({ success: true });

    } catch (err: any) {
        res.status(400).json({ msg: err.message });
    }
};


/* ======================================================
   GET ALL WALLETS
====================================================== */
export const getWallets = async (_: Request, res: Response) => {
    const wallets = await Wallet.findAll();
    res.json(wallets);
};
