import { Sequelize, DataTypes } from "sequelize";

import sequelize from "../util/database.js";

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // password: {
    //     type: DataTypes.STRING,
    //     allowNull: false
    // },
    // accessLevel: {
    //     type: DataTypes.STRING,
    //     allowNull: false
    // },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

export default User;
