import { Sequelize } from "sequelize";

const sequelize = new Sequelize("node-shop", "root", "", {
    dialect: "mysql",
    host: "127.0.0.1",
    timezone: "+03:30"
});

export default sequelize;
