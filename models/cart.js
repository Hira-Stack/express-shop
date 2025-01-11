import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../util/database.js";

const Cart = sequelize.define("Cart", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    totalPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.00
    }
});

export default Cart;