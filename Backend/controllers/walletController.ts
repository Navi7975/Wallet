import { Request, Response } from "express";
import sequelize from "../config/db";
import { Wallet, Transaction, Ledger } from "../models";
import { withRetry } from "../utils/withRetry";

export const createWallet = async (req: Request, res: Response) => {
    const { userId, assetType } = req.body;

    const wallet = await Wallet.create({ userId, assetType });

    res.json(wallet);
};

export const getBalance = async (req: Request, res: Response) => {
    const walletId = Number(req.params.walletId);

    const balance =
        (await Ledger.sum("amount", { where: { walletId } })) || 0;

    res.json({ balance });
};

export const getHistory = async (req: Request, res: Response) => {
    const walletId = Number(req.params.walletId);

    const history = await Ledger.findAll({
        where: { walletId },
        order: [["createdAt", "DESC"]],
    });

    res.json(history);
};



export const createTransaction = async (req: Request, res: Response) => {
    const { walletId, amount, type, idempotencyKey } = req.body;

    if (!walletId || !amount || amount <= 0 || !type || !idempotencyKey) {
        return res.status(400).json({ msg: "Invalid request data" });
    }

    try {
        await withRetry(async () => {
            const t = await sequelize.transaction();

            // 1️⃣ Idempotency check
            const existing = await Transaction.findOne({
                where: { idempotencyKey },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            if (existing) {
                await t.rollback();
                return; // silently ignore duplicate
            }

            // 2️⃣ Lock wallet
            await Wallet.findByPk(walletId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            // 3️⃣ Current balance
            const balance =
                (await Ledger.sum("amount", {
                    where: { walletId },
                    transaction: t,
                })) || 0;

            // 4️⃣ Decide ledger amount based on type
            const ledgerAmount =
                type === "purchase" ? -Math.abs(amount) : Math.abs(amount);

            // 5️⃣ Insufficient funds check
            if (ledgerAmount < 0 && balance + ledgerAmount < 0) {
                await t.rollback();
                throw new Error("Insufficient funds");
            }

            // 6️⃣ Create transaction
            const tx = await Transaction.create(
                { idempotencyKey, type },
                { transaction: t }
            );

            // 7️⃣ Create ledger entry
            await Ledger.create(
                {
                    walletId,
                    transactionId: tx.id,
                    amount: ledgerAmount,
                },
                { transaction: t }
            );

            await t.commit();
        });

        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ msg: err.message });
    }
};


export const getWallets = async (_: Request, res: Response) => {
    const wallets = await Wallet.findAll();
    res.json(wallets);
};
