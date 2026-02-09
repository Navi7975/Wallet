import sequelize from "../config/db";
import { User, Wallet, Transaction, Ledger } from "../models";

const seed = async () => {
    await sequelize.sync();

    console.log("Seeding database...");

    // Create treasury/system user
    const treasuryUser = await User.create({ name: "SYSTEM_TREASURY" });

    const treasuryWallet = await Wallet.create({
        userId: treasuryUser.id,
        assetType: "Coins",
    });

    console.log("Treasury wallet created:", treasuryWallet.id);

    // Create sample users
    const alice = await User.create({ name: "Alice" });
    const bob = await User.create({ name: "Bob" });

    const aliceWallet = await Wallet.create({
        userId: alice.id,
        assetType: "Coins",
    });

    const bobWallet = await Wallet.create({
        userId: bob.id,
        assetType: "Coins",
    });

    console.log("Users created:", alice.id, bob.id);

    // Treasury → Alice top-up
    const tx1 = await Transaction.create({
        idempotencyKey: "seed-alice",
        type: "topup",
    });

    await Ledger.bulkCreate([
        { walletId: treasuryWallet.id, transactionId: tx1.id, amount: -1000 },
        { walletId: aliceWallet.id, transactionId: tx1.id, amount: +1000 },
    ]);

    // Treasury → Bob top-up
    const tx2 = await Transaction.create({
        idempotencyKey: "seed-bob",
        type: "topup",
    });

    await Ledger.bulkCreate([
        { walletId: treasuryWallet.id, transactionId: tx2.id, amount: -500 },
        { walletId: bobWallet.id, transactionId: tx2.id, amount: +500 },
    ]);

    console.log("Initial balances seeded");

    process.exit();
};

seed();
