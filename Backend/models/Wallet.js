"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Wallet extends sequelize_1.Model {
}
Wallet.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    assetType: { type: sequelize_1.DataTypes.STRING, allowNull: false },
}, { sequelize: db_1.default, tableName: "wallets" });
exports.default = Wallet;
