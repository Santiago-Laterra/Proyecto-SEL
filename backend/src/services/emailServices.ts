import nodemailer from 'nodemailer';

// Para desarrollo, te recomiendo usar Mailtrap.io o una App Password de Gmail
// En emailServices.ts
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Debe ser true para el puerto 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // AGREGAMOS ESTO PARA EVITAR QUE SE QUEDE COLGADO:
  connectionTimeout: 10000, // 10 segundos máximo de espera
  greetingTimeout: 5000,
  socketTimeout: 10000,
});
export const sendResetEmail = async (email: string, resetUrl: string) => {
  console.log("🚀 Iniciando proceso de envío de mail a:", email);

  const mailOptions = {
    from: `"Soleyah" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recuperación de contraseña - Soleyah',
    html: `<p>Haz clic aquí para resetear: <a href="${resetUrl}">${resetUrl}</a></p>`,
  };

  try {
    console.log("⏳ Intentando conectar con Gmail...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Mail enviado con éxito! ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ ERROR CRÍTICO enviando el mail:", error);
    throw error; // Lanzamos el error para que el controlador lo atrape
  }
};
