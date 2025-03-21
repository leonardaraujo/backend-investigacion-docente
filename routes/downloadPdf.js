import express from "express";
import { Doc_file_route } from "../models/Index.js"; // Importar el modelo Doc_file_route
import fs from "node:fs";
import path from "node:path";

const downloadRouter = express.Router();

downloadRouter.get("/download-pdf/:doc_file_route_id", async (req, res) => {
	const { doc_file_route_id } = req.params;

	try {
		// Consultar el path del archivo PDF desde el modelo Doc_file_route
		const docFileRoute = await Doc_file_route.findOne({
			where: { id: doc_file_route_id },
		});

		if (!docFileRoute) {
			return res.status(404).send("Archivo no encontrado");
		}

		const pdfPath = docFileRoute.path;

		// Verificar si el archivo existe
		if (!fs.existsSync(pdfPath)) {
			return res.status(404).send("Archivo no encontrado en el servidor");
		}

		// Enviar el PDF para su descarga
		res.download(pdfPath, path.basename(pdfPath), (err) => {
			if (err) {
				console.error("Error al enviar el PDF para su descarga:", err);
			}
		});
	} catch (error) {
		console.error("Error al obtener el archivo PDF:", error);
		res.status(500).send("Error al obtener el archivo PDF");
	}
});

export default downloadRouter;
