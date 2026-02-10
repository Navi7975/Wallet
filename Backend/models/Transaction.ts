import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface TransactionAttributes {
    id: number;
    idempotencyKey: string;
    type: string;
    status?: string; // Consider adding status field
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, "id"> { }

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
    public id!: number;
    public idempotencyKey!: string;
    public type!: string;
    public status?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Transaction.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        idempotencyKey: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending',
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "transactions",
        timestamps: true
    }
);

export default Transaction;