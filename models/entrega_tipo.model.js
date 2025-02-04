import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EntregaTipo = sequelize.define('EntregaTipo', {
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
  tableName: 'entrega_tipo',
  timestamps: false
});

export default EntregaTipo;