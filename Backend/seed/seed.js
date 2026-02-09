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
const db_1 = __importDefault(require("../config/db"));
const models_1 = require("../models");
const seed = () => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.sync();
    console.log("Seeding database...");
    // Create treasury/system user
    const treasuryUser = yield models_1.User.create({ name: "SYSTEM_TREASURY" });
    const treasuryWallet = yield models_1.Wallet.create({
        userId: treasuryUser.id,
        assetType: "Coins",
    });
    console.log("Treasury wallet created:", treasuryWallet.id);
    // Create sample users
    const alice = yield models_1.User.create({ name: "Alice" });
    const bob = yield models_1.User.create({ name: "Bob" });
    const aliceWallet = yield models_1.Wallet.create({
        userId: alice.id,
        assetType: "Coins",
    });
    const bobWallet = yield models_1.Wallet.create({
        userId: bob.id,
        assetType: "Coins",
    });
    console.log("Users created:", alice.id, bob.id);
    // Treasury → Alice top-up
    const tx1 = yield models_1.Transaction.create({
        idempotencyKey: "seed-alice",
        type: "topup",
    });
    yield models_1.Ledger.bulkCreate([
        { walletId: treasuryWallet.id, transactionId: tx1.id, amount: -1000 },
        { walletId: aliceWallet.id, transactionId: tx1.id, amount: +1000 },
    ]);
    // Treasury → Bob top-up
    const tx2 = yield models_1.Transaction.create({
        idempotencyKey: "seed-bob",
        type: "topup",
    });
    yield models_1.Ledger.bulkCreate([
        { walletId: treasuryWallet.id, transactionId: tx2.id, amount: -500 },
        { walletId: bobWallet.id, transactionId: tx2.id, amount: +500 },
    ]);
    console.log("Initial balances seeded");
    process.exit();
});
seed();
