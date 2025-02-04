import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PeriodoInvestigacion = sequelize.define(
  "PeriodoInvestigacion",
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
    tableName: "periodo_investigacion",
    timestamps: false,
  }
);

export default PeriodoInvestigacion;
