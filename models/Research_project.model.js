import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Research_period from "./Research_period.model.js";
const Research_project = sequelize.define(
  "research_project",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    finish_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status_project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    line_research_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    research_period_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Research_period,
        key: "id",
      },
    }
  },
  {
    tableName: "research_projects",
    timestamps: false,
  }
);

export default Research_project;
