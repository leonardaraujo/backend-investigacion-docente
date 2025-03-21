import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Doc_file_route from "./Doc_file_route.model.js";
import User from "./User.model.js";
const Observation = sequelize.define(
	"observation",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: User, // Referenciar al modelo User
				key: "id",
			},
		},
		start_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		finish_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		status_observation_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		doc_file_route_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: Doc_file_route,
				key: "id",
			},
		},
		comments: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "observations",
		timestamps: false,
	},
);

export default Observation;
