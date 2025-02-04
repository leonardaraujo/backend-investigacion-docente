import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProyectState = sequelize.define('ProyectState', {
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
  tableName: 'proyect_states',
  timestamps: false
});

export default ProyectState;