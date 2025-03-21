import express from "express";
import {
	User,
	Research_period,
	Research_project,
	Project_delivery,
	User_research_project,
	Review,
	Observation,
	Doc_file_route,
} from "../models/Index.js";

const getDatarouter = express.Router();

// Ruta para obtener todos los usuarios
getDatarouter.get("/usuarios", async (req, res) => {
	try {
		const usuarios = await User.findAll();
		res.json(usuarios);
	} catch (err) {
		console.error("Error al obtener los usuarios: " + err.stack);
		res.status(500).send("Error al obtener los usuarios");
	}
});

// Nueva ruta para consultar la tabla research_period
getDatarouter.get("/last_research_period_to_create", async (req, res) => {
	try {
		const lastPeriod = await Research_period.findOne({
			order: [["period_number", "DESC"]],
		});

		if (lastPeriod) {
			const newPeriodNumber = lastPeriod.period_number + 1;
			res.json({ message: "Nuevo periodo", period_number: newPeriodNumber });
		} else {
			res.json({ message: "La tabla está vacía", period_number: 1 });
		}
	} catch (err) {
		console.error("Error al consultar la tabla research_period: " + err.stack);
		res.status(500).send("Error al consultar la tabla research_period");
	}
});

// Nueva ruta para obtener los usuarios con rol 3 (investigadores)
getDatarouter.get("/get_investigators", async (req, res) => {
	try {
		const investigadores = await User.findAll({
			where: { rol_id: 3 },
		});
		res.json(investigadores);
	} catch (err) {
		console.error("Error al obtener los investigadores: " + err.stack);
		res.status(500).send("Error al obtener los investigadores");
	}
});

// Nueva ruta para obtener todos los periodos con status_id 1 (activo)
getDatarouter.get("/active_periods", async (req, res) => {
	try {
		const activePeriods = await Research_period.findAll({
			where: { status_id: 1 },
		});
		res.json(activePeriods);
	} catch (err) {
		console.error("Error al obtener los periodos activos: " + err.stack);
		res.status(500).send("Error al obtener los periodos activos");
	}
});

// Nueva ruta para obtener todas las entregas de acuerdo al proyecto que tenga un periodo específico
getDatarouter.get("/deliveries_by_period/:period_id", async (req, res) => {
	const { period_id } = req.params;
	try {
		const projects = await Research_project.findAll({
			where: { research_period_id: period_id },
			include: {
				model: User_research_project,
				include: [
					{
						model: Project_delivery, // Sin alias
					},
					{
						model: User, // Incluir el usuario asociado a la entrega
						attributes: [
							"id",
							"name",
							"paternal_surname",
							"maternal_surname",
							"email",
						],
					},
				],
			},
		});
		res.json(projects);
	} catch (err) {
		console.error("Error al obtener las entregas por periodo: " + err.stack);
		res.status(500).send("Error al obtener las entregas por periodo");
	}
});
// Nueva ruta para obtener todas las entregas completas de tipo 2 (avances) de acuerdo al proyecto que tenga un periodo específico
getDatarouter.get(
	"/deliveries_only_avances_by_period_full/:period_id",
	async (req, res) => {
		const { period_id } = req.params;
		try {
			const projects = await Research_project.findAll({
				where: { research_period_id: period_id },
				include: {
					model: User_research_project,
					include: [
						{
							model: Project_delivery,
							where: { delivery_type_id: 1 }, // Solo incluir entregas de tipo 2 (avances)
							include: [
								{
									model: Review,
									include: [
										{
											model: Observation,
											include: [
												{
													model: Doc_file_route, // Incluir doc_file_route de la observación
												},
											],
										},
									],
								},
								{
									model: Doc_file_route, // Incluir doc_file_route
								},
							],
						},
					],
				},
			});
			res.json(projects);
		} catch (err) {
			console.error(
				"Error al obtener las entregas completas de tipo 2 por periodo: " +
					err.stack,
			);
			res
				.status(500)
				.send("Error al obtener las entregas completas de tipo 2 por periodo");
		}
	},
);

// Nueva ruta para obtener todas las entregas completas de tipo 2 (avances) de un usuario específico de acuerdo al proyecto que tenga un periodo específico
getDatarouter.get(
	"/deliveries_only_avances_by_user_and_period_full/:user_id/:period_number",
	async (req, res) => {
		const { user_id, period_number } = req.params;
		try {
			const period = await Research_period.findOne({
				where: { period_number },
			});

			if (!period) {
				return res.status(404).send("Periodo no encontrado");
			}

			const projects = await Research_project.findAll({
				where: { research_period_id: period.id },
				include: {
					model: User_research_project,
					where: { user_id: user_id },
					include: [
						{
							model: Project_delivery,
							where: { delivery_type_id: 1 },
							include: [
								{
									model: Review,
									include: [
										{
											model: Observation,
											include: [
												{
													model: Doc_file_route, // Incluir doc_file_route de la observación
												},
											],
										},
									],
								},
								{
									model: Doc_file_route, // Incluir doc_file_route
								},
							],
						},
					],
				},
			});
			res.json(projects);
		} catch (err) {
			console.error(
				"Error al obtener las entregas completas de tipo 2 por usuario y periodo: " +
					err.stack,
			);
			res
				.status(500)
				.send(
					"Error al obtener las entregas completas de tipo 2 por usuario y periodo",
				);
		}
	},
);

// Nueva ruta para obtener todas las entregas completas de tipo 2 (entregas finales) de un usuario específico de acuerdo al proyecto que tenga un periodo específico
getDatarouter.get(
	"/deliveries_only_final_by_user_and_period_full/:user_id/:period_number",
	async (req, res) => {
		const { user_id, period_number } = req.params;
		try {
			const period = await Research_period.findOne({
				where: { period_number },
			});

			if (!period) {
				return res.status(404).send("Periodo no encontrado");
			}

			const projects = await Research_project.findAll({
				where: { research_period_id: period.id },
				include: {
					model: User_research_project,
					where: { user_id: user_id },
					include: [
						{
							model: Project_delivery,
							where: { delivery_type_id: 2 }, // Solo incluir entregas de tipo 2 (entregas finales)
							include: [
								{
									model: Review,
									include: [
										{
											model: Observation,
											include: [
												{
													model: Doc_file_route, // Incluir doc_file_route de la observación
												},
											],
										},
									],
								},
								{
									model: Doc_file_route, // Incluir doc_file_route
								},
							],
						},
					],
				},
			});
			res.json(projects);
		} catch (err) {
			console.error(
				"Error al obtener las entregas completas de tipo 2 por usuario y periodo: " +
					err.stack,
			);
			res
				.status(500)
				.send(
					"Error al obtener las entregas completas de tipo 2 por usuario y periodo",
				);
		}
	},
);

// Nueva ruta para obtener todas las entregas completas de tipo 2 (entregas finales) de acuerdo al proyecto que tenga un periodo específico
getDatarouter.get(
	"/deliveries_only_final_by_period_full/:period_id",
	async (req, res) => {
		const { period_id } = req.params;
		try {
			const projects = await Research_project.findAll({
				where: { research_period_id: period_id },
				include: {
					model: User_research_project,
					include: [
						{
							model: Project_delivery,
							where: { delivery_type_id: 2 }, // Solo incluir entregas de tipo 2 (entregas finales)
							include: [
								{
									model: Review,
									include: [
										{
											model: Observation,
											include: [
												{
													model: Doc_file_route, // Incluir doc_file_route de la observación
												},
											],
										},
									],
								},
								{
									model: Doc_file_route, // Incluir doc_file_route
								},
							],
						},
					],
				},
			});
			res.json(projects);
		} catch (err) {
			console.error(
				"Error al obtener las entregas completas de tipo 2 por periodo: " +
					err.stack,
			);
			res
				.status(500)
				.send("Error al obtener las entregas completas de tipo 2 por periodo");
		}
	},
);
export default getDatarouter;

getDatarouter.get("/deliveries_full_by_period/:period_id", async (req, res) => {
	const { period_id } = req.params;
	try {
		const projects = await Research_project.findAll({
			where: { research_period_id: period_id },
			include: {
				model: User_research_project,
				include: [
					{
						model: Project_delivery,
						include: [
							{
								model: Review,
								include: [
									{
										model: Observation,
										include: [
											{
												model: Doc_file_route, // Incluir doc_file_route de la observación
											},
										],
									},
								],
							},
							{
								model: Doc_file_route, // Incluir doc_file_route
							},
						],
					},
					{
						model: User, // Incluir el usuario asociado a la entrega
						attributes: [
							"id",
							"name",
							"paternal_surname",
							"maternal_surname",
							"email",
						],
					},
				],
			},
		});
		res.json(projects);
	} catch (err) {
		console.error(
			"Error al obtener las entregas completas por periodo: " + err.stack,
		);
		res.status(500).send("Error al obtener las entregas completas por periodo");
	}
});
