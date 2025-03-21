import brevo from "@getbrevo/brevo";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import {
  Research_period,
  Research_project,
  User_research_project,
  Project_delivery,
  User,
} from "../models/Index.js";
import { Op } from "sequelize";

// Configurar dayjs para usar timezone
dayjs.extend(utc);
dayjs.extend(timezone);

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_TOKEN
);

/**
 * Función principal para enviar recordatorios de entregas próximas a vencer
 * Se ejecutará como un cronjob diario a las 7:00 AM
 */
async function sendDeliveryReminders() {
  try {
    console.log("=================================================");
    console.log("INICIANDO ENVÍO DE RECORDATORIOS DE ENTREGAS");
    console.log(`FECHA: ${dayjs().tz("America/Bogota").format("DD/MM/YYYY HH:mm:ss")}`);
    console.log("=================================================");

    // Fecha actual en zona horaria de Bogotá
    const currentDate = dayjs().tz("America/Bogota");
    
    // Fecha límite para enviar recordatorios (10 días después de hoy)
    const reminderDate = currentDate.add(10, "day").endOf("day").toDate();

    console.log(`Verificando entregas con fecha límite entre: ${currentDate.format("DD/MM/YYYY")} y ${dayjs(reminderDate).format("DD/MM/YYYY")}`);

    // 1. OBTENER PERIODOS ACTIVOS
    console.log("\n>> PASO 1: Obteniendo periodos activos");
    const activePeriods = await Research_period.findAll({
      where: { status_id: 1 },
      attributes: ["id", "period_number", "start_date", "finish_date"],
    });

    if (activePeriods.length === 0) {
      console.log("No hay periodos activos. Finalizando proceso.");
      return;
    }

    console.log(`Periodos activos encontrados: ${activePeriods.length}`);
    activePeriods.forEach((period, index) => {
      console.log(`  ${index + 1}. Periodo #${period.period_number} (ID: ${period.id}) - Inicio: ${dayjs(period.start_date).format("DD/MM/YYYY") || "No definido"}`);
    });

    // Obtener IDs de los periodos activos para filtrado
    const activePeriodIds = activePeriods.map(period => period.id);

    // 2. OBTENER TODAS LAS ENTREGAS PENDIENTES DE PERIODOS ACTIVOS EN UN SOLO PASO
    console.log("\n>> PASO 2: Obteniendo entregas pendientes de periodos activos");
    
    // Esta consulta más eficiente obtiene directamente las entregas pendientes
    // filtrando primero por proyectos asociados a periodos activos
    const pendingDeliveries = await Project_delivery.findAll({
      where: {
        delivery_status_id: 1, // En curso
        finish_date: {
          [Op.lte]: reminderDate,
          [Op.gt]: currentDate.toDate()
        }
      },
      include: [
        {
          model: User_research_project,
          required: true,
          include: [
            {
              model: User,
              required: true,
              attributes: ["id", "name", "paternal_surname", "maternal_surname", "email"]
            },
            {
              model: Research_project,
              required: true,
              where: {
                research_period_id: {
                  [Op.in]: activePeriodIds // Solo proyectos de periodos activos
                },
                status_project_id: 1 // Solo proyectos activos
              },
              attributes: ["id", "name", "research_period_id"]
            }
          ]
        }
      ],
      order: [['finish_date', 'ASC']] // Ordenar por fecha de vencimiento (más cercanas primero)
    });

    console.log(`Total de entregas pendientes encontradas: ${pendingDeliveries.length}`);

    if (pendingDeliveries.length === 0) {
      console.log("No hay entregas pendientes próximas a vencer. Finalizando proceso.");
      return;
    }

    // 3. AGRUPAR ENTREGAS POR PERIODO PARA MEJOR VISUALIZACIÓN
    console.log("\n>> PASO 3: Agrupando entregas por periodo");
    
    // Crear un objeto para agrupar entregas por periodo
    const deliveriesByPeriod = {};
    
    // Agrupar las entregas por periodo
    pendingDeliveries.forEach(delivery => {
      const periodId = delivery.user_research_project.research_project.research_period_id;
      
      if (!deliveriesByPeriod[periodId]) {
        // Encontrar el periodo correspondiente
        const period = activePeriods.find(p => p.id === periodId);
        
        deliveriesByPeriod[periodId] = {
          periodNumber: period.period_number,
          periodId: periodId,
          deliveries: []
        };
      }
      
      deliveriesByPeriod[periodId].deliveries.push(delivery);
    });
    
    // 4. PROCESAR Y MOSTRAR RESUMEN POR PERIODO
    console.log("\n>> PASO 4: Procesando entregas por periodo");
    
    // Contadores generales
    let totalEmailsSent = 0;
    let totalEmailsFailed = 0;
    
    // Procesar cada periodo
    for (const periodId in deliveriesByPeriod) {
      const periodData = deliveriesByPeriod[periodId];
      const periodDeliveries = periodData.deliveries;
      
      console.log(`\nProcesando Periodo #${periodData.periodNumber} (ID: ${periodId})`);
      console.log(`  Entregas pendientes: ${periodDeliveries.length}`);
      
      // Mostrar resumen de entregas para este periodo
      console.log("\n  Resumen de entregas a notificar:");
      
      periodDeliveries.forEach((delivery, index) => {
        const project = delivery.user_research_project.research_project;
        const user = delivery.user_research_project.user;
        const deliveryType = delivery.delivery_type_id === 1 ? "AVANCE" : "ENTREGA FINAL";
        const daysLeft = dayjs(delivery.finish_date).diff(currentDate, "day");
        
        console.log(`    ${index + 1}. ${deliveryType} #${delivery.delivery_number}`);
        console.log(`       Proyecto: ${project.name} (ID: ${project.id})`);
        console.log(`       Usuario: ${user.name} ${user.paternal_surname} ${user.maternal_surname}`);
        console.log(`       Email: ${user.email || "No disponible"}`);
        console.log(`       Fecha límite: ${dayjs(delivery.finish_date).format("DD/MM/YYYY")} (${daysLeft} días restantes)`);
      });
      
      // Enviar correos para las entregas de este periodo
      console.log("\n  Enviando recordatorios para este periodo:");
      
      let periodEmailsSent = 0;
      let periodEmailsFailed = 0;
      
      for (const delivery of periodDeliveries) {
        try {
          // Verificar que las relaciones existan
          if (!delivery.user_research_project || 
              !delivery.user_research_project.user || 
              !delivery.user_research_project.research_project) {
            throw new Error("Faltan datos relacionados para esta entrega");
          }
          
          const user = delivery.user_research_project.user;
          const project = delivery.user_research_project.research_project;
          
          // Verificar que el usuario tenga email
          if (!user.email) {
            throw new Error(`El usuario ${user.name} ${user.paternal_surname} no tiene email registrado`);
          }
          
          const deliveryType = delivery.delivery_type_id === 1 ? "AVANCE" : "ENTREGA FINAL";
          const daysUntilDeadline = dayjs(delivery.finish_date).diff(currentDate, "day");
          
          console.log(`\n    Procesando entrega: ${deliveryType} #${delivery.delivery_number} (ID: ${delivery.id})`);
          console.log(`      Para: ${user.name} ${user.paternal_surname} (${user.email})`);
          
          // Crear contenido del correo
          const emailContent = `
            <html>
              <body>
                <h2>Recordatorio de Entrega Pendiente</h2>
                <p>Estimado/a ${user.name} ${user.paternal_surname} ${user.maternal_surname},</p>
                <p>Le escribimos para recordarle que tiene una entrega pendiente próxima a vencer:</p>
                <div style="margin: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                  <p><strong>Proyecto:</strong> ${project.name}</p>
                  <p><strong>Tipo de entrega:</strong> ${deliveryType}</p>
                  <p><strong>Número de entrega:</strong> ${delivery.delivery_number}</p>
                  <p><strong>Fecha límite:</strong> ${dayjs(delivery.finish_date).format("DD/MM/YYYY")}</p>
                  <p><strong>Días restantes:</strong> ${daysUntilDeadline}</p>
                </div>
                <p>Por favor, asegúrese de realizar su entrega antes de la fecha límite para evitar inconvenientes.</p>
                <p>Si ya ha realizado su entrega o necesita asistencia, comuníquese con nosotros lo antes posible.</p>
                <p>Atentamente,<br>
                Oficina del Instituto Especializado de Investigación<br>
                investigaciones@uncp.edu.pe</p>
              </body>
            </html>
          `;

          // Configurar el correo
          const sendSmtpEmail = new brevo.SendSmtpEmail();
          sendSmtpEmail.subject = `RECORDATORIO: Entrega de ${deliveryType} #${delivery.delivery_number} próxima a vencer`;
          sendSmtpEmail.to = [{ email: user.email }];
          sendSmtpEmail.htmlContent = emailContent;
          sendSmtpEmail.sender = {
            name: "Sistema de Recordatorios UNCP",
            email: "leonardoaraujo.oct@gmail.com",
          };

          // Enviar el correo
          const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
          console.log(`      ✓ RECORDATORIO ENVIADO EXITOSAMENTE (MessageID: ${result.messageId})`);
          periodEmailsSent++;
          totalEmailsSent++;
        } catch (emailError) {
          console.error(`      ✗ ERROR AL ENVIAR RECORDATORIO: ${emailError.message}`);
          periodEmailsFailed++;
          totalEmailsFailed++;
        }
      }
      
      // Mostrar resumen del periodo
      console.log(`\n  Resumen del periodo #${periodData.periodNumber}:`);
      console.log(`    Entregas procesadas: ${periodDeliveries.length}`);
      console.log(`    Correos enviados: ${periodEmailsSent}`);
      console.log(`    Correos fallidos: ${periodEmailsFailed}`);
    }
    
    // 5. MOSTRAR RESUMEN GENERAL
    console.log("\n=================================================");
    console.log("RESUMEN GENERAL DEL PROCESO");
    console.log("=================================================");
    console.log(`Periodos activos procesados: ${Object.keys(deliveriesByPeriod).length}`);
    console.log(`Total de entregas procesadas: ${pendingDeliveries.length}`);
    console.log(`Total de recordatorios enviados: ${totalEmailsSent}`);
    console.log(`Total de recordatorios fallidos: ${totalEmailsFailed}`);
    console.log(`Proceso completado: ${dayjs().tz("America/Bogota").format("DD/MM/YYYY HH:mm:ss")}`);
    console.log("=================================================");
    
  } catch (error) {
    console.error("\n=================================================");
    console.error("ERROR GENERAL EN EL PROCESO DE ENVÍO DE RECORDATORIOS");
    console.error("=================================================");
    console.error(error);
    console.error("=================================================");
  }
}

export default sendDeliveryReminders;