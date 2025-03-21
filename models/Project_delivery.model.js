import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User_research_project from "./User_research_project.model.js";
import Review from "./Review.model.js";
import Doc_file_route from "./Doc_file_route.model.js";

const Project_delivery = sequelize.define(
  "project_delivery",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    delivery_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    delivery_status_id: {
      type: DataTypes.INTEGER,
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
    delivery_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_research_project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User_research_project,
        key: "id",
      },
    },
    doc_file_route_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Doc_file_route,
        key: "id",
      },
    },
    review_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Review,
        key: "id",
      },
    },
  },
  {
    tableName: "project_deliveries",
    timestamps: false,
  }
);

export default Project_delivery;
