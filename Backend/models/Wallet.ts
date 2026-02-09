import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface Attr {
    id: number;
    userId: number;
    assetType: string;
}

interface Create extends Optional<Attr, "id"> { }

class Wallet extends Model<Attr, Create> implements Attr {
    public id!: number;
    public userId!: number;
    public assetType!: string;
}

Wallet.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        userId: { type: DataTypes.INTEGER, allowNull: false },
        assetType: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize, tableName: "wallets" }
);

export default Wallet;
