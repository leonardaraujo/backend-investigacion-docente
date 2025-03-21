import express from "express";
import { Research_project, User_research_project, Project_delivery, Research_period, User } from "../models/Index.js";

const userDataRouter = express.Router();

// Ruta para consultar todas las entregas de un usuario en un periodo específico
userDataRouter.get("/deliveries_by_user_and_period/:user_id/:period_id", async (req, res) => {
  const { user_id, period_id } = req.params;

  try {
    const period = await Research_period.findOne({
      where: { id: period_id },
    });

    if (!period) {
      return res.status(404).json({ message: "Periodo no encontrado" });
    }

    const projects = await Research_project.findAll({
      where: { research_period_id: period.id },
      include: {
        model: User_research_project,
        where: { user_id: user_id },
        include: [
          {
            model: Project_delivery,
            include: [
              {
                model: User_research_project,
                include: [
                  {
                    model: User,
                    attributes: ["id", "name", "paternal_surname", "maternal_surname", "email"],
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    res.json(projects);
  } catch (err) {
    console.error("Error al obtener las entregas del usuario por periodo: " + err.stack);
    res.status(500).json({ message: "Error al obtener las entregas del usuario por periodo", error: err.message });
  }
});

export default userDataRouter;