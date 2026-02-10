import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface LedgerAttributes {
    id: number;
    walletId: number;
    transactionId: number;
    amount: number;
    balanceAfter?: number;
}

interface LedgerCreationAttributes
    extends Optional<LedgerAttributes, "id"> { }

class Ledger
    extends Model<LedgerAttributes, LedgerCreationAttributes>
    implements LedgerAttributes {
    public id!: number;
    public walletId!: number;
    public transactionId!: number;
    public amount!: number;
    public balanceAfter?: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Ledger.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        walletId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        transactionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        balanceAfter: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "ledger_entries",
        timestamps: true,
    }
);

export default Ledger;
