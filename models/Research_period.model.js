import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Doc_file_route from "./Doc_file_route.model.js";
const Research_period = sequelize.define(
	"research_period",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		period_number: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
		},
		start_date: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		finish_date: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		status_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		doc_file_route_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: Doc_file_route,
				key: "id",
			},
		},
	},
	{
		tableName: "research_periods",
		timestamps: false,
	},
);

export default Research_period;
