import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Doc_file_route = sequelize.define(
	"doc_file_route",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		path: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		upload_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		tableName: "doc_file_routes",
		timestamps: false,
	},
);

export default Doc_file_route;
