import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.model.js";
import Proyecto from "./Proyect.model.js";

const ProyectoUsuario = sequelize.define(
  "ProyectoUsuario",
  {
    id: {  // NUEVO: ID único para referencias
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    proyecto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Proyecto,
        key: "id",
      },
    },
    date_asigment: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "proyecto_usuario",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["user_id", "proyecto_id"] }, // ÍNDICE PARA EVITAR DUPLICADOS
    ],
  }
);

// Definir relaciones
User.hasMany(ProyectoUsuario, { foreignKey: "user_id" });
ProyectoUsuario.belongsTo(User, { foreignKey: "user_id" });

Proyecto.hasMany(ProyectoUsuario, { foreignKey: "proyecto_id" });
ProyectoUsuario.belongsTo(Proyecto, { foreignKey: "proyecto_id" });

export default ProyectoUsuario;
