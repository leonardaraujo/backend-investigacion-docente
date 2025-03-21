import User from "./User.model.js";
import User_research_project from "./User_research_project.model.js";
import Research_project from "./Research_project.model.js";
import Project_delivery from "./Project_delivery.model.js";
import Research_period from "./Research_period.model.js";
import Review from "./Review.model.js";
import Observation from "./Observation.model.js";
import Doc_file_route from "./Doc_file_route.model.js";
// Definir la asociación entre User y User_research_project
User.hasMany(User_research_project, { foreignKey: "user_id" });
User_research_project.belongsTo(User, { foreignKey: "user_id" });

// Definir la asociación entre Research_project y User_research_project
Research_project.hasMany(User_research_project, {
  foreignKey: "research_project_id",
});
User_research_project.belongsTo(Research_project, {
  foreignKey: "research_project_id",
});

// Definir la asociación entre User_research_project y Project_delivery
User_research_project.hasMany(Project_delivery, {
  foreignKey: "user_research_project_id",
});
Project_delivery.belongsTo(User_research_project, {
  foreignKey: "user_research_project_id",
});

// Definir la asociación entre Research_project y Research_period
Research_period.hasMany(Research_project, {
  foreignKey: "research_period_id",
});
Research_project.belongsTo(Research_period, {
  foreignKey: "research_period_id",
});

// Definir la asociación
Review.belongsTo(Observation, { foreignKey: "observation_id" });
Observation.hasMany(Review, { foreignKey: "observation_id" });

Project_delivery.belongsTo(Review, { foreignKey: "review_id" });
Review.hasMany(Project_delivery, { foreignKey: "review_id" });

//Relacion doc_file_route
Project_delivery.belongsTo(Doc_file_route, { foreignKey: "doc_file_route_id" });
Doc_file_route.hasMany(Project_delivery, { foreignKey: "doc_file_route_id" });

// Definir la asociación
Observation.belongsTo(Doc_file_route, { foreignKey: "doc_file_route_id" });
Doc_file_route.hasMany(Observation, { foreignKey: "doc_file_route_id" });

// Relacion doc_file_route con Research_period
Research_period.belongsTo(Doc_file_route, { foreignKey: "doc_file_route_id" });
Doc_file_route.hasMany(Research_period, { foreignKey: "doc_file_route_id" });


// Definir la asociación entre User y Observation
User.hasMany(Observation, { foreignKey: "user_id" });
Observation.belongsTo(User, { foreignKey: "user_id" });

// Definir la asociación entre User y Review
User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

// Exportar todos los modelos
export {
  User,
  User_research_project,
  Research_project,
  Project_delivery,
  Research_period,
  Review,
  Observation,
  Doc_file_route,
};
