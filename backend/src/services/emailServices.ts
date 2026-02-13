import nodemailer from 'nodemailer';

// Para desarrollo, te recomiendo usar Mailtrap.io o una App Password de Gmail
// En emailServices.ts
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // OBLIGATORIO: false para puerto 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Esto ayuda a que Render no bloquee la conexión si el certificado tiene algún hipo
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Error de configuración de correo:", error);
  } else {
    console.log("🚀 Servidor listo para enviar correos!");
  }
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
