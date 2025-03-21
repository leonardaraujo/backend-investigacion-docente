import express from "express";
import sendEmail from "../utils/sendEmails.js"; // Importar la función sendEmail

const sendEmailRouter = express.Router();

sendEmailRouter.post("/send_emails_schedule/:period_id", async (req, res) => {
  const { period_id } = req.params;

  try {
    await sendEmail(period_id);
    res.status(200).json({ message: "Correos enviados exitosamente" });
  } catch (error) {
    console.error("Error al enviar correos: " + error.stack);
    res.status(500).json({ message: "Error al enviar correos", error: error.message });
  }
});

export default sendEmailRouter;