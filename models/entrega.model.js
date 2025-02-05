import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import EntregaEstado from "./entrega_estado.model.js";
import EntregaTipo from "./entrega_tipo.model.js";
import ProyectoUsuario from "./proyecto_usuario.model.js";
const Entrega = sequelize.define(
  "Entrega",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    numero_entrega: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    entrega_estado_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: EntregaEstado,
        key: "id",
      },
    },
    fecha_entrega: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_revision: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    admision_entrega_fecha_init: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    admision_entrega_fecha_finish: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    entrega_tipo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: EntregaTipo,
        key: "id",
      },
    },
    usuario_proyecto_id: { // REFERENCIA AL ID ÚNICO EN proyecto_usuario
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProyectoUsuario,
        key: "id",
      },
    },
  },
  {
    tableName: "entrega",
    timestamps: false,
  }
);

// Definir relaciones
Entrega.belongsTo(EntregaEstado, { foreignKey: "entrega_estado_id" });
Entrega.belongsTo(EntregaTipo, { foreignKey: "entrega_tipo_id" });
Entrega.belongsTo(ProyectoUsuario, { foreignKey: "usuario_proyecto_id" });

export default Entrega;
