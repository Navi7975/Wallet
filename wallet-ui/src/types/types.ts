export interface Wallet {
    id: number;
    userId: number;
    assetType: string;
}

export interface LedgerEntry {
    id: number;
    amount: number;
    walletId: number;
    transactionId: number;
    createdAt: string;
}
