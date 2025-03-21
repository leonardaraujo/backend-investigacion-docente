import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises"; // Para manejar archivos async
import {
	Project_delivery,
	Doc_file_route,
	User_research_project,
	Research_project,
	Research_period,
	User,
	Observation,
} from "../models/Index.js";

const uploadFinalRouter = express.Router();

export const DELIVERY_TYPES = [
	{ id: 1, tipo: "AVANCE" },
	{ id: 2, tipo: "ENTREGA FINAL" },
];

// Configuración de multer (carga en memoria primero)
const storage = multer.memoryStorage();

// Nueva ruta para subir archivos comprimidos de entregas finales
const uploadCompressed = multer({
	storage,
	limits: { fileSize: 50 * 1024 * 1024 }, // Limitar el tamaño del archivo a 50MB
	fileFilter: (req, file, cb) => {
		const allowedMimeTypes = [
			"application/x-rar-compressed",
			"application/vnd.rar",
			"application/zip",
			"application/x-zip-compressed",
			"multipart/x-zip",
			"application/x-7z-compressed",
			"application/x-tar",
			"application/gzip",
		];
		if (allowedMimeTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new Error(
					"Solo se permiten archivos comprimidos (RAR, ZIP, 7Z, TAR, GZIP)",
				),
				false,
			);
		}
	},
});

uploadFinalRouter.post(
	"/entrega-final-comprimido",
	uploadCompressed.single("file"),
	async (req, res) => {
		const { project_delivery_id } = req.body;
		console.log("El project delivery es", project_delivery_id);
		if (!req.file) {
			return res
				.status(400)
				.json({ message: "No se ha subido ningún archivo" });
		}

		try {
			const projectDelivery = await Project_delivery.findOne({
				where: { id: project_delivery_id },
				include: [
					{
						model: User_research_project,
						include: [
							{
								model: Research_project,
								include: [{ model: Research_period, attributes: ["id"] }],
							},
						],
					},
				],
			});

			if (!projectDelivery) {
				return res
					.status(404)
					.json({ message: "Project delivery no encontrado" });
			}

			const deliveryType = DELIVERY_TYPES.find(
				(type) => type.id === projectDelivery.delivery_type_id,
			);

			if (!deliveryType) {
				return res
					.status(400)
					.json({ message: "Tipo de entrega no encontrado" });
			}

			const periodId =
				projectDelivery.user_research_project.research_project.research_period
					.id;
			const userResearchProjectId = projectDelivery.user_research_project.id;
			const timestamp = Date.now();
			const ext = path.extname(req.file.originalname);
			const basename = deliveryType.tipo.toUpperCase();
			const index =
				deliveryType.id === 2 ? `_${projectDelivery.delivery_number}` : "";

			// Definir la ruta de almacenamiento final
			const filename = `PF${periodId}-UP-${userResearchProjectId}-${basename}-${timestamp}${ext}`;
			const filepath = `uploads/deliveries/final/${filename}`;

			// Crear el directorio si no existe
			await fs.mkdir(path.dirname(filepath), { recursive: true });

			// Guardar el archivo en disco
			await fs.writeFile(filepath, req.file.buffer);

			// Crear el registro en la base de datos
			const newDocFileRoute = await Doc_file_route.create({
				path: filepath,
				upload_date: new Date(),
			});

			// Actualizar el project_delivery con doc_file_route_id
			await Project_delivery.update(
				{ doc_file_route_id: newDocFileRoute.id },
				{ where: { id: project_delivery_id } },
			);

			res.status(200).json({
				message: "Archivo cargado exitosamente",
				file: filename,
			});
		} catch (err) {
			res.status(500).json({
				message: "Error al cargar el archivo",
				error: err.message,
			});
		}
	},
);

// Nueva ruta para subir archivos RAR de observaciones
uploadFinalRouter.post(
	"/entrega-final-observacion-comprimido",
	uploadCompressed.single("file"),
	async (req, res) => {
		const { observation_id } = req.body;
		console.log("El observation id es", observation_id);
		if (!req.file) {
			return res
				.status(400)
				.json({ message: "No se ha subido ningún archivo" });
		}

		try {
			const observation = await Observation.findOne({
				where: { id: observation_id },
			});

			if (!observation) {
				return res.status(404).json({ message: "Observación no encontrada" });
			}

			const timestamp = Date.now();
			const ext = path.extname(req.file.originalname);
			const filename = `OBS-${observation.id}-${timestamp}${ext}`;
			const filepath = `uploads/deliveries/final/observations/${filename}`;

			// Crear el directorio si no existe
			await fs.mkdir(path.dirname(filepath), { recursive: true });

			// Guardar el archivo en disco
			await fs.writeFile(filepath, req.file.buffer);

			// Crear el registro en la base de datos
			const newDocFileRoute = await Doc_file_route.create({
				path: filepath,
				upload_date: new Date(),
			});

			// Actualizar la observación con doc_file_route_id
			await Observation.update(
				{ doc_file_route_id: newDocFileRoute.id },
				{ where: { id: observation_id } },
			);

			res.status(200).json({
				message: "Archivo cargado exitosamente",
				file: filename,
			});
		} catch (err) {
			res.status(500).json({
				message: "Error al cargar el archivo",
				error: err.message,
			});
		}
	},
);

export default uploadFinalRouter;
