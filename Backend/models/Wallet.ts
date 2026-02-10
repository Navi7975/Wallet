import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface WalletAttributes {
    id: number;
    userId: number;
    assetType: string;
    balance: number;
}

interface WalletCreationAttributes
    extends Optional<WalletAttributes, "id" | "balance"> { }

class Wallet
    extends Model<WalletAttributes, WalletCreationAttributes>
    implements WalletAttributes {
    public id!: number;
    public userId!: number;
    public assetType!: string;
    public balance!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Wallet.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        assetType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        balance: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: "wallets",
        timestamps: true,
    }
);

export default Wallet;
