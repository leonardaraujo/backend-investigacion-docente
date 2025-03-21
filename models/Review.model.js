import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Observation from "./Observation.model.js";
import User from "./User.model.js";
const Review = sequelize.define(
	"review",
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
				model: User, // Referenciar al modelo User
				key: "id",
			},
		},
		status_review_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		review_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		observation_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: Observation,
				key: "id",
			},
		},
		comments: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "reviews",
		timestamps: false,
	},
);

export default Review;
