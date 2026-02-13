import nodemailer from 'nodemailer';

// Para desarrollo, te recomiendo usar Mailtrap.io o una App Password de Gmail
// En emailServices.ts
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // seloyahtienda@gmail.com
    pass: process.env.EMAIL_PASS, // owyjteqrtxmegbh
  },
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
