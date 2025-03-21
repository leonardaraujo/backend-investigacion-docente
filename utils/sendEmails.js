import brevo from "@getbrevo/brevo";
import fs from "fs";
import path from "path";
import {
  Research_project,
  User,
  User_research_project,
  Project_delivery,
  Research_period,
  Doc_file_route,
} from "../models/Index.js";
import { generatePDF } from "./createPdf64.js"; // Importar la función para generar el PDF

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_TOKEN
);

export const DELIVERY_TYPES = [
  { id: 1, tipo: "AVANCE" },
  { id: 2, tipo: "ENTREGA FINAL" },
];

async function sendEmail(period_id) {
  try {
    console.log(`Periodo ID recibido: ${period_id}`);
    
    // Consultar todos los proyectos relacionados al periodo
    const projects = await Research_project.findAll({
      where: { research_period_id: period_id },
      include: [
        {
          model: User_research_project,
          include: [
            {
              model: User,
              attributes: ["email", "name"],
            },
            {
              model: Project_delivery,
            },
          ],
        },
      ],
    });

    console.log(`Proyectos encontrados: ${projects.length}`);

    // Obtener el Research_period
    const researchPeriod = await Research_period.findOne({
      where: { id: period_id },
      include: {
        model: Doc_file_route,
        attributes: ["path"],
      },
    });

    if (!researchPeriod) {
      console.log(`Periodo de investigación no encontrado para ID: ${period_id}`);
      throw new Error("Periodo de investigación no encontrado");
    }

    let pdfPath;
    if (!researchPeriod.doc_file_route_id) {
      // Generar el PDF y guardar la relación
      pdfPath = await generatePDF(projects, `cronograma_entregas_periodo_${period_id}.pdf`);
      const newDocFileRoute = await Doc_file_route.create({
        path: pdfPath,
        upload_date: new Date(), // Proporcionar el valor para upload_date
      });
      researchPeriod.doc_file_route_id = newDocFileRoute.id;
      await researchPeriod.save();
    } else {
      // Obtener el path del archivo PDF desde el modelo Doc_file_route
      if (!researchPeriod.Doc_file_route) {
        throw new Error("Archivo no encontrado");
      }
      pdfPath = researchPeriod.Doc_file_route.path;
    }

    // Leer el archivo PDF y convertirlo a base64
    const pdfBase64 = fs.readFileSync(pdfPath, { encoding: "base64" });

    // Obtener todas las direcciones de correo electrónico de los usuarios
    const users = projects
      .flatMap((project) =>
        project.user_research_projects.map((urp) => urp.user)
      )
      .filter((user, index, self) => self.findIndex(u => u.email === user.email) === index); // Eliminar duplicados

    console.log(`Usuarios encontrados: ${users.length}`);

    // Enviar correos personalizados a cada usuario
    for (const user of users) {
      const emailContent = `
        <html>
          <body>
            <p>Estimado/a ${user.name},</p>
            <p>Espero que este mensaje le encuentre bien.</p>
            <p>Adjunto encontrará el cronograma de entregas correspondiente al periodo ${period_id}, con las fechas y requisitos establecidos para cada fase del proceso. Le solicitamos revisar el documento y asegurarse de cumplir con los plazos indicados para garantizar una gestión eficiente.</p>
            <p>Si tiene alguna consulta o requiere aclaraciones, no dude en ponerse en contacto.</p>
            <p>Quedamos atentos a su confirmación.</p>
            <p>Atentamente,<br>
            Oficina del Instituto de Investigación<br>
            investigaciones@universidadonlinegpt.edu<br>
    
          </body>
        </html>
      `;

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `Cronograma de Entregas para el Periodo ${period_id}`;
      sendSmtpEmail.to = [{ email: user.email }];
      sendSmtpEmail.htmlContent = emailContent;
      sendSmtpEmail.sender = {
        name: "Servicio de notificaciones Universidad Online GPT",
        email: "leonardoaraujo.oct@gmail.com",
      };
      sendSmtpEmail.attachment = [
        {
          content: pdfBase64,
          name: path.basename(pdfPath),
          type: "application/pdf",
          disposition: "attachment",
        },
      ];

      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`Correo enviado a ${user.email}:`, result);
    }
  } catch (error) {
    console.error(error);
  }
}

export default sendEmail;