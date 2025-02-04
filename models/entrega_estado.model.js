import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EntregaEstado = sequelize.define('EntregaEstado', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'entrega_estado',
  timestamps: false
});

export default EntregaEstado;