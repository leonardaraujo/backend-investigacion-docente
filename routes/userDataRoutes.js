import express from "express";
import {
  Research_project,
  User_research_project,
  Research_period,
  User,
} from "../models/Index.js";

const userDataRouter = express.Router();

// Ruta para obtener datos de los proyectos de los usuarios de un periodo específico que esté activo
userDataRouter.get("/user_projects_by_period/:period_id", async (req, res) => {
  const { period_id } = req.params;

  try {
    // Verificar si el periodo está activo (status_id es 1)
    const researchPeriod = await Research_period.findOne({
      where: { id: period_id, status_id: 1 },
    });

    if (!researchPeriod) {
      return res
        .status(404)
        .json({ message: "Periodo no encontrado o no está activo" });
    }

    // Obtener los proyectos asignados a los usuarios en el periodo activo
    const projects = await Research_project.findAll({
      where: { research_period_id: period_id },
      include: {
        model: User_research_project,
        include: {
          model: User,
          attributes: [
            "id",
            "name",
            "paternal_surname",
            "maternal_surname",
            "email",
          ],
        },
      },
    });

    res.json(projects);
  } catch (err) {
    console.error(
      "Error al obtener los proyectos de los usuarios por periodo: " +
        err.stack
    );
    res
      .status(500)
      .send("Error al obtener los proyectos de los usuarios por periodo");
  }
});

export default userDataRouter;