import { Router } from "express";
import {
    createWallet,
    getBalance,
    getHistory,
    createTransaction,getWallets
} from "../controllers/walletController";

const router = Router();

router.post("/create", createWallet);
router.post("/transaction", createTransaction);
router.get("/:walletId/balance", getBalance);
router.get("/:walletId/history", getHistory);
router.get("/", getWallets);
export default router;
