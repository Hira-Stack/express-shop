import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../util/database.js";

const CartItem = sequelize.define("Cart-Item", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});

export default CartItem;