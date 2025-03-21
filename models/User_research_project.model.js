import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.model.js";
import Research_project from "./Research_project.model.js";

const User_research_project = sequelize.define(
  "user_research_project",
  {
    id: {
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
    research_project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Research_project,
        key: "id",
      },
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_research_projects",
    timestamps: false,
  }
);

export default User_research_project;
