import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {User} from "../models/Index.js";

const authRoutes = express.Router();
const secretKey = process.env.SECRET_WEBTOKEN; // Usar la clave secreta desde las variables de entorno

// Ruta para autenticar un usuario
authRoutes.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ where: { email } })
    .then((user) => {
      if (!user) {
        return res.status(404).send("Usuario no encontrado");
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error("Error al comparar las contraseñas: " + err.stack);
          return res.status(500).send("Error al comparar las contraseñas");
        }
        if (result) {
          // Generar un token JWT
          const token = jwt.sign(
            { id: user.id, email: user.email },
            secretKey,
            { expiresIn: "1d" }
          );
          return res.json({ authenticated: true, token });
        } else {
          return res.status(401).send("Contraseña incorrecta");
        }
      });
    })
    .catch((err) => {
      console.error("Error al obtener el usuario: " + err.stack);
      return res.status(500).send("Error al obtener el usuario");
    });
});

// Ruta para agregar un nuevo usuario
authRoutes.post("/register", async (req, res) => {
  const { name, name_paterno, name_materno, email, password, role_id } =
    req.body;
  console.log(req.body);
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({
      name,
      name_paterno,
      name_materno,
      email,
      password: hashedPassword,
      role_id,
    });
    res.status(201).send("Usuario agregado exitosamente");
  } catch (err) {
    console.error("Error al agregar el usuario: " + err.stack);
    res.status(500).send("Error al agregar el usuario");
  }
});

export default authRoutes;
