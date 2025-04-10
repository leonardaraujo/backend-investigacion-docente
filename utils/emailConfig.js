import dotenv from 'dotenv';

dotenv.config();

// Determinar qué universidad está activa
const activeUniversity = process.env.UNIVERSITY || 'GPT'; // Por defecto es GPT

// Configuración de correo electrónico según la universidad activa
export const getEmailConfig = () => {
  if (activeUniversity === 'UNCP') {
    return {
      senderName: process.env.UNCP_EMAIL_SENDER_NAME || 'Servicio de notificaciones UNCP',
      senderEmail: 'leonardoaraujo.oct@gmail.com', // Mantener el mismo email para pruebas
      instituteName: process.env.UNCP_INSTITUTE_NAME || 'Oficina del Instituto Especializado de Investigación',
      contactEmail: process.env.UNCP_EMAIL_SENDER || 'investigaciones@uncp.edu.pe',
      universityName: 'Universidad Nacional del Centro del Perú'
    };
  } else {
    return {
      senderName: process.env.GPT_EMAIL_SENDER_NAME || 'Servicio de notificaciones Universidad Online GPT',
      senderEmail: 'leonardoaraujo.oct@gmail.com', // Mantener el mismo email para pruebas
      instituteName: process.env.GPT_INSTITUTE_NAME || 'Oficina del Instituto de Investigación',
      contactEmail: process.env.GPT_EMAIL_SENDER || 'investigaciones@universidadonlinegpt.edu',
      universityName: 'Universidad Online GPT'
    };
  }
};

export default getEmailConfig;