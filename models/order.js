import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../util/database.js";

const Order = sequelize.define("Order", {
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

export default Order;