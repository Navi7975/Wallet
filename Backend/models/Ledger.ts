import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface Attr {
    id: number;
    walletId: number;
    transactionId: number;
    amount: number;
}

interface Create extends Optional<Attr, "id"> { }

class Ledger extends Model<Attr, Create> implements Attr {
    public id!: number;
    public walletId!: number;
    public transactionId!: number;
    public amount!: number;
}

Ledger.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        walletId: { type: DataTypes.INTEGER, allowNull: false },
        transactionId: { type: DataTypes.INTEGER, allowNull: false },
        amount: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, tableName: "ledger_entries", timestamps: true }
);

export default Ledger;
