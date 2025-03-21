import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const DELIVERY_TYPES = [
  { id: 1, tipo: "AVANCE" },
  { id: 2, tipo: "ENTREGA FINAL" },
];

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para convertir una imagen a base64
const imageToBase64 = (filePath) => {
  const bitmap = fs.readFileSync(filePath);
  return Buffer.from(bitmap).toString("base64");
};

// Ruta de la imagen del logo
const logoPath = path.resolve(__dirname, "uncp_logo.png");
const logoBase64 = imageToBase64(logoPath);

// Función para obtener el nombre del tipo de entrega
const getDeliveryTypeName = (id) => {
  const deliveryType = DELIVERY_TYPES.find((type) => type.id === id);
  return deliveryType ? deliveryType.tipo : "Desconocido";
};

// Convertir datos JSON a HTML
const generateHTML = (data) => {
  let htmlContent = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cronograma de presentaciones de investigacion</title>
      <style>
          body { font-family: Arial, sans-serif; text-align: center; }
          h1 { margin-bottom: 20px; }
          table { width: 100%; margin: 0 auto; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 10px; text-align: center; }
          th { background-color: #e0e0e0; }
          .logo { position: absolute; top: 20px; left: 20px; width:50px; }
      </style>
  </head>
  <body>
      <img src="data:image/png;base64,${logoBase64}" class="logo" alt="Logo">
      <h1>Cronograma de Actividades</h1>
      <table>
          <tr>
              <th rowspan="2">Nombre del proyecto</th>
              <th rowspan="2">Fecha de inicio de proyecto</th>
              <th rowspan="2">Fecha de fin de proyecto</th>
              <th colspan="3">Entregas</th>
          </tr>
          <tr>
              <th>Tipo de Entrega</th>
              <th>Fecha de inicio</th>
              <th>Fecha de fin</th>
          </tr>`;

  data.forEach((project) => {
    const projectRowSpan = project.user_research_projects.reduce(
      (acc, userProject) => acc + userProject.project_deliveries.length,
      0
    );
    let firstRow = true;

    project.user_research_projects.forEach((userProject) => {
      // Ordenar las entregas por delivery_number
      const sortedDeliveries = userProject.project_deliveries.sort(
        (a, b) => a.delivery_number - b.delivery_number
      );

      sortedDeliveries.forEach((delivery) => {
        htmlContent += `
          <tr>
              ${
                firstRow
                  ? `<td rowspan="${projectRowSpan}">${
                      project.name +
                      "\n" +
                      userProject.user.email
                    }</td>`
                  : ""
              }
              ${
                firstRow
                  ? `<td rowspan="${projectRowSpan}">${new Date(
                      project.start_date
                    ).toLocaleDateString()}</td>`
                  : ""
              }
              ${
                firstRow
                  ? `<td rowspan="${projectRowSpan}">${new Date(
                      project.finish_date
                    ).toLocaleDateString()}</td>`
                  : ""
              }
              <td>${getDeliveryTypeName(delivery.delivery_type_id)}${
          delivery.delivery_type_id == 1 ? ` ${delivery.delivery_number}` : ``
        }</td>
              <td>${new Date(delivery.start_date).toLocaleDateString()}</td>
              <td>${new Date(delivery.finish_date).toLocaleDateString()}</td>
          </tr>`;
        firstRow = false;
      });
    });
  });

  htmlContent += `
      </table>
  </body>
  </html>`;
  return htmlContent;
};

// Función para generar el PDF y guardarlo en una carpeta
export async function generatePDF(data, filename) {
  const htmlContent = generateHTML(data);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Cargar el contenido HTML
  await page.setContent(htmlContent, { waitUntil: "load" });

  // Generar el PDF en formato horizontal
  const pdfBuffer = await page.pdf({
    format: "A4",
    landscape: true, // Formato horizontal
    printBackground: true,
    margin: { top: "15mm", right: "10mm", bottom: "15mm", left: "10mm" },
  });

  await browser.close();

  // Crear la carpeta si no existe
  const uploadDir = path.resolve(__dirname, "../uploads/schedules");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Guardar el PDF en la carpeta
  const pdfPath = path.join(uploadDir, filename);
  fs.writeFileSync(pdfPath, pdfBuffer);

  return pdfPath;
}