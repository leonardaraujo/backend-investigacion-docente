import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
	"user",
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
		paternal_surname: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		maternal_surname: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		rol_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		tableName: "users",
		timestamps: false,
	},
);

export default User;
