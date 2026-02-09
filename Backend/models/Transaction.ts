import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface Attr {
    id: number;
    idempotencyKey: string;
    type: string;
}

interface Create extends Optional<Attr, "id"> { }

class Transaction extends Model<Attr, Create> implements Attr {
    public id!: number;
    public idempotencyKey!: string;
    public type!: string;
}

Transaction.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        idempotencyKey: { type: DataTypes.STRING, unique: true, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize, tableName: "transactions" }
);

export default Transaction;
