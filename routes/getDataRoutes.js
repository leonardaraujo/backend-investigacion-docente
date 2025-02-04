import express from "express";
import {
  User,
  ProyectoUsuario,
  Proyecto,
  PeriodoInvestigacion,
  Rol,
  LineaInvestigacion,
  Entrega,
  EntregaEstado,
  EntregaTipo,
  ProyectState,
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

// Ruta para obtener todos los registros de proyecto_usuario
getDatarouter.get("/proyectos_usuario", async (req, res) => {
  try {
    const proyectosUsuario = await ProyectoUsuario.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: Proyecto,
          attributes: ["id", "nombre"],
          include: [
            {
              model: PeriodoInvestigacion,
              attributes: ["id", "nombre"],
            },
          ],
        },
      ],
    });
    res.json(proyectosUsuario);
  } catch (err) {
    console.error("Error al obtener los proyectos_usuario: " + err.stack);
    res.status(500).send("Error al obtener los proyectos_usuario");
  }
});

// Ruta para obtener el último periodo de investigación
getDatarouter.get("/ultimo_periodo_investigacion", async (req, res) => {
  try {
    const ultimoPeriodo = await PeriodoInvestigacion.findOne({
      order: [["id", "DESC"]],
    });
    if (!ultimoPeriodo) {
      return res
        .status(404)
        .send("No se encontró ningún periodo de investigación");
    }
    res.json(ultimoPeriodo);
  } catch (err) {
    console.error(
      "Error al obtener el último periodo de investigación: " + err.stack
    );
    res.status(500).send("Error al obtener el último periodo de investigación");
  }
});

// Ruta para obtener todos los usuarios con role_id igual a 1
getDatarouter.get("/usuarios/role/1", async (req, res) => {
  try {
    const usuarios = await User.findAll({
      where: { role_id: 1 },
      include: [
        {
          model: Rol,
          attributes: ["id", "nombre"],
        },
      ],
    });
    res.json(usuarios);
  } catch (err) {
    console.error("Error al obtener los usuarios con role_id 1: " + err.stack);
    res.status(500).send("Error al obtener los usuarios con role_id 1");
  }
});

// Ruta para obtener todas las líneas de investigación
getDatarouter.get("/lineas_investigacion", async (req, res) => {
  try {
    const lineasInvestigacion = await LineaInvestigacion.findAll();
    res.json(lineasInvestigacion);
  } catch (err) {
    console.error("Error al obtener las líneas de investigación: " + err.stack);
    res.status(500).send("Error al obtener las líneas de investigación");
  }
});

// Ruta para consultar todos los proyectos con sus relaciones
getDatarouter.get('/proyectos/:periodo_id', async (req, res) => {
    const { periodo_id } = req.params;
    try {
      const proyectos = await Proyecto.findAll({
        where: { periodo_id },
        include: [
          {
            model: ProyectState,
            attributes: ['id', 'nombre'],
          },
          {
            model: LineaInvestigacion,
            attributes: ['id', 'nombre'],
          },
          {
            model: PeriodoInvestigacion,
            attributes: ['id', 'nombre'],
          },
        ],
      });
      res.json(proyectos);
    } catch (err) {
      console.error('Error al obtener los proyectos: ' + err.stack);
      res.status(500).send('Error al obtener los proyectos');
    }
  });

// Ruta para consultar todas las entregas con sus relaciones
getDatarouter.get("/entregas", async (req, res) => {
  try {
    const entregas = await Entrega.findAll({
      include: [
        {
          model: EntregaEstado,
          attributes: ["id", "nombre"],
        },
        {
          model: EntregaTipo,
          attributes: ["id", "nombre"],
        },
        {
          model: ProyectoUsuario,
          attributes: ["user_id", "proyecto_id"],
          include: [
            {
              model: User,
              attributes: ["id", "name", "email"],
            },
            {
              model: Proyecto,
              attributes: ["id", "nombre"],
            },
          ],
        },
      ],
    });
    res.json(entregas);
  } catch (err) {
    console.error("Error al obtener las entregas: " + err.stack);
    res.status(500).send("Error al obtener las entregas");
  }
});

// Nueva ruta para consultar todas las entregas de un periodo específic
getDatarouter.get('/entregas/periodo/:periodo_id', async (req, res) => {
    const { periodo_id } = req.params;
    try {
      const entregas = await Entrega.findAll({
        include: [
          {
            model: EntregaEstado,
            attributes: ['id', 'nombre'],
          },
          {
            model: EntregaTipo,
            attributes: ['id', 'nombre'],
          },
          {
            model: ProyectoUsuario,
            attributes: ['user_id', 'proyecto_id'],
            include: [
              {
                model: User,
                attributes: ['id', 'name', 'email'],
              },
              {
                model: Proyecto,
                attributes: ['id', 'nombre'],
                where: { periodo_id },
              },
            ],
          },
        ],
      });
      res.json(entregas);
    } catch (err) {
      console.error('Error al obtener las entregas del periodo: ' + err.stack);
      res.status(500).send('Error al obtener las entregas del periodo');
    }
  });

// Ruta para obtener todos los periodos
getDatarouter.get('/periodos', async (req, res) => {
    try {
      const periodos = await PeriodoInvestigacion.findAll();
      res.json(periodos);
    } catch (err) {
      console.error('Error al obtener los periodos: ' + err.stack);
      res.status(500).send('Error al obtener los periodos');
    }
  });

export default getDatarouter;
