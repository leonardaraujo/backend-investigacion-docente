import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import getDatarouter from "./routes/getDataRoutes.js";
import {
  User,
  Rol,
  PeriodoInvestigacion,
  Proyecto,
  ProyectoUsuario,
  Entrega,
} from "./models/Index.js";
import authGuard from "./middleware/authguard.js";
import authRoutes from "./routes/authRoutes.js";
dotenv.config(); // Configurar dotenv

const app = express();
const port = 3000;
const secretKey = process.env.SECRET_WEBTOKEN; // Usar la clave secreta desde las variables de entorno

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

// Usar las rutas de autenticación
app.use('/auth', authRoutes);
// Usar las rutas de obtención de datos
app.use('/data', getDatarouter);


// Ruta para obtener un usuario por ID
app.get("/auth/getUser", authGuard, async (req, res) => {
  try {
    const user = await User.findByPk(req.id, {
      include: [
        {
          model: Rol,
          attributes: ["id", "nombre"],
        },
      ],
    }); // Utiliza findByPk para buscar por ID e incluir el rol
    if (!user) {
      return res.status(404).send("Usuario no encontrado");
    }
    res.json(user);
  } catch (err) {
    console.error("Error al obtener el usuario: " + err.stack);
    res.status(500).send("Error al obtener el usuario");
  }
});

// Nueva ruta para crear proyectos, relaciones y entregas en conjunto
app.post("/crear_proyectos_y_entregas", async (req, res) => {
  console.log(req.body)
  const { DATA } = req.body;
  try {
    // Verificar si hay periodos existentes
    let ultimoPeriodo = await PeriodoInvestigacion.findOne({
      order: [['id', 'DESC']]
    });

    // Si no hay periodos, crear el primer periodo
    if (!ultimoPeriodo) {
      ultimoPeriodo = await PeriodoInvestigacion.create({
        id: 1,
        nombre: 'Periodo 1',
      });
    } else {
      // Si hay periodos, crear el siguiente periodo
      const nuevoPeriodoId = ultimoPeriodo.id + 1;
      ultimoPeriodo = await PeriodoInvestigacion.create({
        id: nuevoPeriodoId,
        nombre: `Periodo ${nuevoPeriodoId}`,
      });
    }

    const resultados = await Promise.all(DATA.map(async (item) => {
      // Crear el proyecto
      const proyecto = await Proyecto.create({
        nombre: `Proyecto de ${item.name}`,
        initime: item.fechaInicio,
        finishtime: item.fechaEntrega,
        proyect_state_id: 1, // Asumiendo que 1 es el estado inicial del proyecto
        linea_investigacion_id: item.linea_id,
        periodo_id: ultimoPeriodo.id
      });

      // Crear la relación proyecto_usuario
      const proyectoUsuario = await ProyectoUsuario.create({
        user_id: item.id_user,
        proyecto_id: proyecto.id,
        date_asigment: item.fechaInicio
      });

      // Crear las entregas de avances
      const entregasAvances = await Promise.all(item.avances.avancesData.map(async (avance) => {
        return await Entrega.create({
          numero_entrega: avance.index,
          entrega_estado_id: 1, // Asumiendo que 1 es el estado inicial de la entrega
          fecha_entrega: avance.fechaFinish,
          fecha_revision: null,
          admision_entrega_fecha_init: avance.fechaInit,
          admision_entrega_fecha_finish: avance.fechaFinish,
          entrega_tipo_id: 1, // Asumiendo que 1 es el tipo de entrega "Avance"
          usuario_proyecto_id: proyectoUsuario.id
        });
      }));

      // Crear la entrega final
      const fechaEntregaFinal = new Date(item.fechaEntrega);
      const fechaInitFinal = new Date(fechaEntregaFinal);
      fechaInitFinal.setDate(fechaInitFinal.getDate() - 3); // Restar 3 días a la fecha de entrega

      const entregaFinal = await Entrega.create({
        numero_entrega: item.avances.cantAvances + 1,
        entrega_estado_id: 1, // Asumiendo que 1 es el estado inicial de la entrega
        fecha_entrega: item.fechaEntrega,
        fecha_revision: null,
        admision_entrega_fecha_init: fechaInitFinal,
        admision_entrega_fecha_finish: item.fechaEntrega,
        entrega_tipo_id: 2, // Asumiendo que 2 es el tipo de entrega "Final"
        usuario_proyecto_id: proyectoUsuario.id
      });

      return {
        proyecto,
        proyectoUsuario,
        entregasAvances,
        entregaFinal
      };
    }));

    res.status(201).json(resultados);
  } catch (err) {
    console.error("Error al crear los proyectos y entregas: " + err.message);
    res.status(500).send("Error al crear los proyectos y entregas: " + err.message);
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
