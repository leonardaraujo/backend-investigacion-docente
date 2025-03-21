import express from "express";
import { Project_delivery, Review, Observation } from "../models/Index.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
const revisionRouter = express.Router();

dayjs.extend(utc);
dayjs.extend(timezone);

revisionRouter.post("/update_delivery_status", async (req, res) => {
	const {
		delivery_id,
		status_review_id,
		user_id,
		comments,
		start_date,
		finish_date,
	} = req.body;
	console.log("USER ID ES", user_id);
	if (!user_id) {
		console.log("el user id es nulo");
		res.status(400);
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
		}

		await Project_delivery.update(updateData, { where: { id: delivery_id } });

		// Crear una nueva observación si status_review_id es 3
		if (status_review_id === 3) {
			console.log("Se reviso con observaciones");

			// Convertir fechas usando dayjs con zona horaria de Bogotá
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
revisionRouter.post("/update_observation_status", async (req, res) => {
	const {
		observation_id,
		status_observation_id,
		user_id,
		comments,
		delivery_id,
	} = req.body;

	try {
		// Verificar si la observación existe
		const observation = await Observation.findOne({
			where: { id: observation_id },
		});

		if (!observation) {
			return res.status(404).json({ message: "Observación no encontrada" });
		}

		// Actualizar los campos de la observación
		await Observation.update(
			{
				status_observation_id: status_observation_id,
				user_id: user_id,
				comments: comments,
			},
			{ where: { id: observation_id } },
		);

		// Actualizar el delivery_status_id a 2
		await Project_delivery.update(
			{ delivery_status_id: 2 },
			{ where: { id: delivery_id } },
		);

		res
			.status(200)
			.json({ message: "Estado de observación actualizado exitosamente" });
	} catch (err) {
		console.error("Error al actualizar el estado de observación: " + err.stack);
		res.status(500).json({
			message: "Error al actualizar el estado de observación",
			error: err.message,
		});
	}
});

export default revisionRouter;
