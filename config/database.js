import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config(); // Configurar dotenv
console.log(process.env.DATABASE_DB_USER)
// Configuración de la conexión a la base de datos
const sequelize = new Sequelize(
  process.env.DATABASE_DB_NAME,
  process.env.DATABASE_DB_USER,
  process.env.DATABASE_DB_PASS,
  {
    host: process.env.DATABASE_DB_HOST,
    dialect: "mysql",
    port: process.env.DATABASE_DB_PORT, // Asegúrate de que este sea el puerto correcto
  }
);

export default sequelize;
