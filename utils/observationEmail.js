import brevo from "@getbrevo/brevo";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import {
  User,
  Observation,
  Project_delivery,
  User_research_project,
  Research_project,
  Research_period
} from "../models/Index.js";
import path from "path";
import fs from "fs";

// Configurar dayjs para usar timezone
dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar API de Brevo
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_TOKEN
);

/**
 * Envía un correo electrónico al usuario notificando sobre una observación a su entrega
 * @param {Object} observationData - Datos de la observación creada
 * @param {number} deliveryId - ID de la entrega a la que se asocia la observación
 * @returns {Promise<Object>} - Resultado del envío del correo
 */
async function sendObservationEmail(observationData, deliveryId) {
  try {
    console.log("=================================================");
    console.log("INICIANDO ENVÍO DE NOTIFICACIÓN DE OBSERVACIÓN");
    console.log(`FECHA: ${dayjs().tz("America/Bogota").format("DD/MM/YYYY HH:mm:ss")}`);
    console.log("=================================================");
    
    // 1. Obtener la información de la entrega con todos sus datos relacionados
    const delivery = await Project_delivery.findByPk(deliveryId, {
      include: [
        {
          model: User_research_project,
          include: [
            {
              model: User,
              attributes: ["id", "name", "paternal_surname", "maternal_surname", "email"]
            },
            {
              model: Research_project,
              include: [
                {
                  model: Research_period,
                  attributes: ["id", "period_number"]
                }
              ]
            }
          ]
        }
      ]
    });
    
    if (!delivery) {
      throw new Error(`No se encontró la entrega con ID ${deliveryId}`);
    }
    
    // 2. Obtener los datos del usuario
    const user = delivery.user_research_project?.user;
    if (!user) {
      throw new Error(`No se encontró el usuario asociado a la entrega ${deliveryId}`);
    }
    
    if (!user.email) {
      throw new Error(`El usuario ${user.id} no tiene correo electrónico registrado`);
    }
    
    // 3. Obtener datos del proyecto y periodo
    const project = delivery.user_research_project?.research_project;
    const period = project?.research_period;
    
    if (!project || !period) {
      throw new Error(`No se encontró el proyecto o periodo asociado a la entrega ${deliveryId}`);
    }
    
    // 4. Determinar tipo de entrega
    const deliveryType = delivery.delivery_type_id === 1 ? "AVANCE" : "ENTREGA FINAL";
    
    // 5. Formatear fechas
    const startDate = dayjs(observationData.start_date).tz("America/Bogota").format("DD/MM/YYYY");
    const finishDate = dayjs(observationData.finish_date).tz("America/Bogota").format("DD/MM/YYYY");
    
    // 6. Calcular días para corregir
    const daysToFix = dayjs(observationData.finish_date).diff(dayjs(observationData.start_date), 'day');
    
    console.log("\nDatos para el correo:");
    console.log(`  Usuario: ${user.name} ${user.paternal_surname} ${user.maternal_surname}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Periodo: #${period.period_number}`);
    console.log(`  Proyecto: ${project.name}`);
    console.log(`  Entrega: ${deliveryType} #${delivery.delivery_number}`);
    console.log(`  Fecha inicio corrección: ${startDate}`);
    console.log(`  Fecha límite corrección: ${finishDate}`);
    console.log(`  Días para corregir: ${daysToFix}`);
    console.log(`  Comentarios: ${observationData.comments || "No hay comentarios"}`);
    
    // 7. Crear contenido HTML del correo
    const emailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #d9534f; text-align: center; border-bottom: 2px solid #eee; padding-bottom: 10px;">
              Observaciones en su Entrega
            </h2>
            
            <p>Estimado/a ${user.name} ${user.paternal_surname} ${user.maternal_surname},</p>
            
            <p>Le informamos que se han registrado <strong>observaciones</strong> en su entrega reciente:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #d9534f; border-radius: 3px;">
              <p><strong>Proyecto:</strong> ${project.name}</p>
              <p><strong>Periodo de Investigación:</strong> ${period.period_number}</p>
              <p><strong>Tipo de Entrega:</strong> ${deliveryType}</p>
              <p><strong>Número de Entrega:</strong> ${delivery.delivery_number}</p>
            </div>
            
            <h3 style="color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px;">Detalles de las Observaciones</h3>
            
            <p style="white-space: pre-line;">${observationData.comments || "No se especificaron comentarios detallados."}</p>
            
            <div style="background-color: #f2dede; color: #a94442; padding: 15px; margin: 15px 0; border-radius: 3px;">
              <h4 style="margin-top: 0;">Fechas para presentar correcciones:</h4>
              <p><strong>Fecha de inicio:</strong> ${startDate}</p>
              <p><strong>Fecha límite:</strong> ${finishDate}</p>
              <p><strong>Días disponibles para corregir:</strong> ${daysToFix}</p>
            </div>
            
            <p>Por favor, revise cuidadosamente las observaciones señaladas y realice las correcciones necesarias dentro del plazo establecido.</p>
            
            <p>Si tiene alguna consulta o requiere aclaraciones sobre las observaciones, no dude en contactarnos.</p>
            
            <p style="margin-top: 30px;">Atentamente,<br>
            Oficina del Instituto Especializado de Investigación<br>
            Universidad Nacional del Centro del Perú<br>
            investigaciones@uncp.edu.pe</p>
          </div>
        </body>
      </html>
    `;
    
    // 8. Configurar el correo electrónico
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `Observaciones en su entrega - ${deliveryType} #${delivery.delivery_number}`;
    sendSmtpEmail.htmlContent = emailContent;
    sendSmtpEmail.sender = {
      name: "Instituto Especializado de Investigación UNCP",
      email: "leonardoaraujo.oct@gmail.com",
    };
    sendSmtpEmail.to = [{ email: user.email }];
    
    // 9. Adjuntar el archivo de observaciones si existe
    if (observationData.doc_file_route_id) {
      try {
        // Buscar la ruta del archivo
        const fileRoute = await Doc_file_route.findByPk(observationData.doc_file_route_id);
        
        if (fileRoute && fileRoute.path) {
          const filePath = fileRoute.path;
          
          // Verificar que el archivo existe
          if (fs.existsSync(filePath)) {
            // Leer el archivo y convertirlo a base64
            const fileContent = fs.readFileSync(filePath);
            const fileBase64 = fileContent.toString('base64');
            
            // Añadir el archivo como adjunto
            sendSmtpEmail.attachment = [
              {
                content: fileBase64,
                name: path.basename(filePath),
                type: path.extname(filePath).substring(1) === 'pdf' ? 'application/pdf' : 'application/octet-stream',
                disposition: "attachment"
              }
            ];
            
            console.log(`  Adjuntando archivo: ${path.basename(filePath)}`);
          } else {
            console.log(`  Advertencia: El archivo de observaciones no existe en la ruta: ${filePath}`);
          }
        }
      } catch (fileError) {
        console.error(`  Error al procesar el archivo adjunto: ${fileError.message}`);
        // Continuar sin adjunto si hay error
      }
    }
    
    // 10. Enviar el correo
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log(`\n✓ CORREO ENVIADO EXITOSAMENTE`);
    console.log(`  ID del mensaje: ${result.messageId}`);
    console.log(`  Enviado a: ${user.email}`);
    console.log("=================================================");
    
    return {
      success: true,
      messageId: result.messageId,
      sentTo: user.email
    };
    
  } catch (error) {
    console.error("\n✗ ERROR AL ENVIAR CORREO DE OBSERVACIÓN:");
    console.error(`  ${error.message}`);
    console.error("=================================================");
    
    return {
      success: false,
      error: error.message
    };
  }
}

export default sendObservationEmail;