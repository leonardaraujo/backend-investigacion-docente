import express from "express";
import {
	Project_delivery,
	Review,
	Observation,
	Research_project,
} from "../models/Index.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
const finalRevisionRouter = express.Router();

dayjs.extend(utc);
dayjs.extend(timezone);
// Ruta para actualizar el valor delivery_status_id de un delivery específico y crear una nueva revisión
finalRevisionRouter.post("/update_final_delivery_status", async (req, res) => {
	const {
		delivery_id,
		status_review_id,
		user_id,
		comments,
		start_date,
		finish_date,
		researchProjectId,
	} = req.body;
	console.log("USER ID ES", user_id);
	if (!user_id) {
		console.log("el user id es nulo");
		return res.status(400).json({ message: "El user_id es nulo" });
	}

	try {
		// Verificar si el delivery existe
		const delivery = await Project_delivery.findOne({
			where: { id: delivery_id },
		});

		if (!delivery) {
			return res.status(404).json({ message: "Delivery no encontrado" });
		}

		// Crear una nueva revisión con fecha usando dayjs
		const newReview = await Review.create({
			user_id: user_id,
			status_review_id: status_review_id,
			review_date: dayjs().tz("America/Bogota").toDate(),
			comments: comments,
		});

		// Actualizar el valor delivery_status_id y review_id
		const updateData = { review_id: newReview.id };
		if (status_review_id === 2) {
			console.log("Se reviso sin problemas");
			updateData.delivery_status_id = 2;

			// Actualizar el estado del proyecto a 2
			await Research_project.update(
				{ status_project_id: 2 },
				{ where: { id: researchProjectId } },
			);
		}

		await Project_delivery.update(updateData, { where: { id: delivery_id } });

		// Crear una nueva observación si status_review_id es 3
		if (status_review_id === 3) {
			console.log("Se reviso con observaciones");

			// Usar dayjs para formatear las fechas con zona horaria
			const formattedStartDate = dayjs(start_date)
				.tz("America/Bogota")
				.startOf("day")
				.toDate();

			const formattedFinishDate = dayjs(finish_date)
				.tz("America/Bogota")
				.endOf("day")
				.toDate();

			const newObservation = await Observation.create({
				start_date: formattedStartDate,
				finish_date: formattedFinishDate,
				status_observation_id: 1,
				comments: null,
			});

			// Actualizar la revisión con la nueva observación
			await Review.update(
				{ observation_id: newObservation.id },
				{ where: { id: newReview.id } },
			);
		}

		res.status(200).json({
			message: "Estado de entrega y revisión actualizados exitosamente",
		});
	} catch (err) {
		console.error(
			"Error al actualizar el estado de entrega y crear la revisión: " +
				err.stack,
		);
		res.status(500).json({
			message: "Error al actualizar el estado de entrega y crear la revisión",
			error: err.message,
		});
	}
});

// Nueva ruta para actualizar el estado de la observación
finalRevisionRouter.post("/update_final_observation", async (req, res) => {
	const {
		observation_id,
		status_observation_id,
		user_id,
		comments,
		delivery_id,
		research_project_id,
	} = req.body;
	console.log("data", req.body);
	try {
		// Verificar si la observación existe
		const observation = await Observation.findOne({
			where: { id: observation_id },
		});

		if (!observation) {
			return res.status(404).json({ message: "Observación no encontrada" });
		}

		// Obtener fecha actual con dayjs en zona horaria de Bogotá
		const currentDate = dayjs().tz("America/Bogota").toDate();

		// Actualizar los campos de la observación
		await Observation.update(
			{
				status_observation_id: status_observation_id,
				user_id: user_id,
				comments: comments,
				updated_at: currentDate, // Agregar fecha de actualización si existe este campo en tu modelo
			},
			{ where: { id: observation_id } },
		);

		// Actualizar el delivery_status_id a 2
		await Project_delivery.update(
			{
				delivery_status_id: 2,
				updated_at: currentDate, // Agregar fecha de actualización si existe este campo en tu modelo
			},
			{ where: { id: delivery_id } },
		);

		// Si status_observation_id es 2, actualizar el estado del proyecto a 2
		if (status_observation_id === 2) {
			await Research_project.update(
				{
					status_project_id: 2,
					updated_at: currentDate, // Agregar fecha de actualización si existe este campo en tu modelo
				},
				{ where: { id: research_project_id } },
			);
		}
		// Si status_observation_id es 4, actualizar el estado del proyecto a 3
		if (status_observation_id === 4) {
			await Research_project.update(
				{
					status_project_id: 3,
					updated_at: currentDate, // Agregar fecha de actualización si existe este campo en tu modelo
				},
				{ where: { id: research_project_id } },
			);
		}

		res.status(200).json({
			message: "Estado de observación actualizado exitosamente",
			updated_at: currentDate,
		});
	} catch (err) {
		console.error("Error al actualizar el estado de observación: " + err.stack);
		res.status(500).json({
			message: "Error al actualizar el estado de observación",
			error: err.message,
		});
	}
});

export default finalRevisionRouter;
