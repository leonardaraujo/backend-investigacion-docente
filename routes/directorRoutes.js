import express from "express";
import { Research_period } from "../models/Index.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { Sequelize } from "sequelize";
const directorRouter = express.Router();

// Configurar dayjs para usar timezone
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Ruta para finalizar un periodo de investigación
 * Actualiza el status_id del periodo a 2 (finalizado)
 */
directorRouter.put("/finalizar-periodo/:period_id", async (req, res) => {
	const { period_id } = req.params;

	try {
		// Verificar si el periodo existe
		const period = await Research_period.findByPk(period_id);

		if (!period) {
			return res.status(404).json({
				success: false,
				message: "Periodo de investigación no encontrado",
			});
		}

		// Verificar si el periodo ya está finalizado
		if (period.status_id === 2) {
			return res.status(400).json({
				success: false,
				message: "Este periodo ya se encuentra finalizado",
			});
		}

		// Obtener la fecha actual con dayjs en zona horaria de Bogotá
		const currentDate = dayjs().tz("America/Bogota").endOf("day").toDate();

		// Actualizar el status_id a 2 (finalizado) y agregar la fecha de finalización
		await Research_period.update(
			{
				status_id: 2,
				finish_date: currentDate, // Establecer la fecha de finalización
			},
			{
				where: { id: period_id },
			},
		);

		// Obtener el periodo actualizado
		const updatedPeriod = await Research_period.findByPk(period_id);

		return res.status(200).json({
			success: true,
			message: "Periodo de investigación finalizado exitosamente",
			data: updatedPeriod,
			fecha_finalizado: dayjs(currentDate).format("YYYY-MM-DD HH:mm:ss"),
		});
	} catch (err) {
		console.error("Error al finalizar el periodo de investigación:", err.stack);
		return res.status(500).json({
			success: false,
			message: "Error al finalizar el periodo de investigación",
			error: err.message,
		});
	}
});

directorRouter.get("/periodos-activos", async (req, res) => {
	try {
		// Obtener todos los periodos activos (status_id = 1)
		const periodosActivos = await Research_period.findAll({
			where: { status_id: 1 },
			order: [["period_number", "DESC"]],
			attributes: [
				"id",
				"period_number",
				"status_id",
				"doc_file_route_id",
				"start_date", // Agregado el campo start_date
				"finish_date", // Agregado el campo finish_date
				[
					Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM research_projects
                        WHERE research_projects.research_period_id = research_period.id
                    )`),
					"total_proyectos",
				],
			],
			raw: true,
		});

		// Devolver directamente el array de periodos activos
		return res.status(200).json(periodosActivos);
	} catch (err) {
		console.error("Error al obtener los periodos activos:", err.stack);
		return res.status(500).json([]); // Devolver un array vacío en caso de error
	}
});

directorRouter.get("/all-periodos", async (req, res) => {
	try {
		// Obtener todos los periodos
		const periodos = await Research_period.findAll({
			order: [["period_number", "ASC"]],
			attributes: [
				"id",
				"period_number",
				"status_id",
				"doc_file_route_id",
				"start_date",
				"finish_date",
				[
					Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM research_projects
                        WHERE research_projects.research_period_id = research_period.id
                    )`),
					"total_proyectos",
				],
			],
			raw: true,
		});

		// Devolver directamente el array de todos los periodos
		return res.status(200).json(periodos);
	} catch (err) {
		console.error("Error al obtener todos los periodos:", err.stack);
		return res.status(500).json([]); // Devolver un array vacío en caso de error
	}
});
export default directorRouter;
