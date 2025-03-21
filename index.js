import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import getDatarouter from "./routes/getDataRoutes.js";
import { User } from "./models/Index.js";
import authGuard from "./middleware/authguard.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";
import downloadRouter from "./routes/downloadPdf.js";
import {
	Research_project,
	User_research_project,
	Project_delivery,
	Research_period,
} from "./models/Index.js";
import sendEmailRouter from "./routes/sendEmailRoutes.js";
import revisionRouter from "./routes/revisionRoute.js";
import uploadFinalRouter from "./routes/uploadFinalRoutes.js";
import userDataRouter from "./routes/userDataRoute.js";
import finalRevisionRouter from "./routes/finalRevisionRoute.js";
import directorRouter from "./routes/directorRoutes.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import sendDeliveryReminders from "./utils/autoRemindersEmail.js";
import cron from "node-cron";

//Cron jobs

cron.schedule("0 7 * * *", async () => {
	await sendDeliveryReminders(); //Envia mensajes recordatorios para las entregas
});

dotenv.config(); // Configurar dotenv

const app = express();
const port = 3000;
dayjs.extend(utc);
dayjs.extend(timezone);
// Middleware para permitir solicitudes CORS desde cualquier origen
app.use(cors());

// Middleware para analizar el cuerpo de las solicitudes como JSON
app.use(express.json());

// Sincronizar los modelos con la base de datos
sequelize
	.sync({ force: false }) // Usa force: false para evitar cambios automáticos en la estructura de la tabla
	.then(() => {
		console.log("Modelos sincronizados con la base de datos");
	})
	.catch((err) => {
		console.error("Error al sincronizar los modelos: ", err);
		process.exit(1); // Salir del proceso si hay un error al sincronizar los modelos
	});

// Ruta de prueba para verificar la conexión
app.get("/", (req, res) => {
	res.send("¡Conexión exitosa a la base de datos!");
});

app.get("/testRemindingEmail", async (req, res) => {
	res.send("Enviando recordatorios de entregas...");
	await sendDeliveryReminders();
});

// Usar las rutas de autenticación
app.use("/auth", authRoutes);
// Usar las rutas de obtención de datos
app.use("/data", getDatarouter);
app.use("/userData", userDataRouter);
app.use("/directorData", directorRouter);
//Usar ruta de envio de correos
app.use("/email", sendEmailRouter);

app.use("/upload", uploadRouter);
app.use("/uploadf", uploadFinalRouter);
app.use("/download", downloadRouter);
app.use("/review", revisionRouter);
app.use("/reviewf", finalRevisionRouter);
// Ruta para obtener un usuario por ID
app.get("/auth/getUser", authGuard, async (req, res) => {
	try {
		const user = await User.findByPk(req.id); // Utiliza findByPk para buscar por ID e incluir el rol
		if (!user) {
			return res.status(404).send("Usuario no encontrado");
		}
		res.json(user);
	} catch (err) {
		console.error(`Error al obtener el usuario: ${err.stack}`);
		res.status(500).send("Error al obtener el usuario");
	}
});

app.post("/crear_proyectos_y_entregas", async (req, res) => {
	const { DATA } = req.body;

	try {
		// Crear o obtener el periodo de investigación
		let researchPeriod = await Research_period.findOne({
			order: [["period_number", "DESC"]],
		});

		// Obtener la fecha actual como fecha de inicio del periodo
		const currentDate = dayjs().tz("America/Bogota").startOf("day").toDate();

		if (!researchPeriod) {
			researchPeriod = await Research_period.create({
				period_number: 1,
				status_id: 1, // 1 es activo
				start_date: currentDate,
				finish_date: null, // La fecha de finalización se dejará como null
			});
		} else {
			researchPeriod = await Research_period.create({
				period_number: researchPeriod.period_number + 1,
				status_id: 1, // 1 es activo
				start_date: currentDate,
				finish_date: null, // La fecha de finalización se dejará como null
			});
		}

		const resultados = await Promise.all(
			DATA.map(async (item) => {
				// Configurar fechas de inicio y fin del proyecto con dayjs
				const startDate = dayjs(item.fechaInicio)
					.tz("America/Bogota")
					.startOf("day")
					.toDate();
				const finishDate = dayjs(item.fechaEntrega)
					.tz("America/Bogota")
					.endOf("day")
					.toDate();

				// Crear el proyecto de investigación
				const researchProject = await Research_project.create({
					name: `Proyecto de ${item.name}`,
					line_research_id: item.linea_id,
					start_date: startDate,
					finish_date: finishDate,
					research_period_id: researchPeriod.id,
					status_project_id: 1, // 1 es activo
				});

				// Crear la relación usuario-proyecto
				const today = dayjs().tz("America/Bogota").toDate();
				const userResearchProject = await User_research_project.create({
					user_id: item.id_user,
					research_project_id: researchProject.id,
					creation_date: today,
				});

				// Crear las entregas de avances
				const entregasAvances = await Promise.all(
					item.avances.map(async (avance) => {
						const avanceStartDate = dayjs(avance.fechaInit)
							.tz("America/Bogota")
							.startOf("day")
							.toDate();
						const avanceFinishDate = dayjs(avance.fechaFinish)
							.tz("America/Bogota")
							.endOf("day")
							.toDate();

						return await Project_delivery.create({
							delivery_number: avance.index,
							delivery_status_id: 1, // 1 ES EN CURSO
							start_date: avanceStartDate,
							finish_date: avanceFinishDate,
							delivery_type_id: 1, // 1 es avance
							user_research_project_id: userResearchProject.id,
						});
					}),
				);

				// Crear la entrega final
				const finalStartDate = dayjs(finishDate)
					.subtract(1, "day")
					.startOf("day")
					.toDate();
				const finalFinishDate = dayjs(finishDate).endOf("day").toDate();

				const entregaFinal = await Project_delivery.create({
					delivery_number: item.avances.length + 1,
					delivery_status_id: 1, // 1 ES EN CURSO
					start_date: finalStartDate,
					finish_date: finalFinishDate,
					delivery_type_id: 2, // 2 es el tipo de entrega "Final"
					user_research_project_id: userResearchProject.id,
				});

				return {
					researchProject,
					userResearchProject,
					entregasAvances,
					entregaFinal,
				};
			}),
		);

		res.status(201).json(resultados);
	} catch (err) {
		console.error("Error al crear los proyectos y entregas: " + err.message);
		res
			.status(500)
			.send("Error al crear los proyectos y entregas: " + err.message);
	}
});

// Manejo de errores global
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send("Algo salió mal!");
});

// Iniciar el servidor
app.listen(port, () => {
	console.log(`Servidor escuchando en http://localhost:${port}`);
});
