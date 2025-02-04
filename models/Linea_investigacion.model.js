import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LineaInvestigacion = sequelize.define('LineaInvestigacion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'linea_investigacion',
  timestamps: false
});

export default LineaInvestigacion;