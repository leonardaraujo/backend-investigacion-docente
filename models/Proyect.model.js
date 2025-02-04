import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import ProyectState from './Proyect_state.model.js';
import LineaInvestigacion from './Linea_investigacion.model.js';
import PeriodoInvestigacion from './Periodo_investigacion.model.js';

const Proyecto = sequelize.define('Proyecto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  initime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  finishtime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  proyect_state_id: {
    type: DataTypes.INTEGER,
    references: {
      model: ProyectState,
      key: 'id'
    }
  },
  linea_investigacion_id: {
    type: DataTypes.INTEGER,
    references: {
      model: LineaInvestigacion,
      key: 'id'
    }
  },
  periodo_id: {
    type: DataTypes.INTEGER,
    references: {
      model: PeriodoInvestigacion,
      key: 'id'
    }
  }
}, {
  tableName: 'proyectos',
  timestamps: false
});

// Definir las relaciones
Proyecto.belongsTo(ProyectState, { foreignKey: 'proyect_state_id' });
Proyecto.belongsTo(LineaInvestigacion, { foreignKey: 'linea_investigacion_id' });
Proyecto.belongsTo(PeriodoInvestigacion, { foreignKey: 'periodo_id' });

export default Proyecto;