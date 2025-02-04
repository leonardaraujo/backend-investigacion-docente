import User from './User.model.js';
import Rol from './Rol.model.js';
import ProyectState from './Proyect_state.model.js';
import LineaInvestigacion from './Linea_investigacion.model.js';
import PeriodoInvestigacion from './Periodo_investigacion.model.js';
import Proyecto from './Proyect.model.js';
import ProyectoUsuario from './proyecto_usuario.model.js';
import Entrega from './entrega.model.js';
import EntregaEstado from './entrega_estado.model.js';
import EntregaTipo from './entrega_tipo.model.js';
// Definir las relaciones
Rol.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Rol, { foreignKey: 'role_id' });

// Definir las relaciones entre Proyecto y otros modelos
Proyecto.belongsTo(ProyectState, { foreignKey: 'proyect_state_id' });
Proyecto.belongsTo(LineaInvestigacion, { foreignKey: 'linea_investigacion_id' });
Proyecto.belongsTo(PeriodoInvestigacion, { foreignKey: 'periodo_id' });

ProyectState.hasMany(Proyecto, { foreignKey: 'proyect_state_id' });
LineaInvestigacion.hasMany(Proyecto, { foreignKey: 'linea_investigacion_id' });
PeriodoInvestigacion.hasMany(Proyecto, { foreignKey: 'periodo_id' });

// Definir las relaciones entre ProyectoUsuario y otros modelos
User.hasMany(ProyectoUsuario, { foreignKey: 'user_id' });
ProyectoUsuario.belongsTo(User, { foreignKey: 'user_id' });

Proyecto.hasMany(ProyectoUsuario, { foreignKey: 'proyecto_id' });
ProyectoUsuario.belongsTo(Proyecto, { foreignKey: 'proyecto_id' });

// Definir las relaciones entre Entrega y otros modelos
Entrega.belongsTo(EntregaEstado, { foreignKey: 'entrega_estado_id' });
Entrega.belongsTo(ProyectoUsuario, { foreignKey: 'usuario_proyecto_id' });
Entrega.belongsTo(EntregaTipo, { foreignKey: 'entrega_tipo_id' });

export { User, Rol, ProyectState, LineaInvestigacion, PeriodoInvestigacion, Proyecto, ProyectoUsuario, EntregaEstado, EntregaTipo, Entrega };