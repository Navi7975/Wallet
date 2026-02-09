import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface Attr { id: number; name: string }
interface Create extends Optional<Attr, "id"> { }

class User extends Model<Attr, Create> implements Attr {
    public id!: number;
    public name!: string;
}

User.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize, tableName: "users" }
);

export default User;
