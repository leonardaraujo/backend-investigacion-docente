import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.model.js";
const Rol = sequelize.define(
  "Rol",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "roles",
    timestamps: false,
  }
);

export default Rol;
