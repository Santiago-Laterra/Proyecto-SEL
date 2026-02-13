import nodemailer from 'nodemailer';

// Para desarrollo, te recomiendo usar Mailtrap.io o una App Password de Gmail
// En emailServices.ts
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true, // FALSE para puerto 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (email: string, resetUrl: string) => {
  const mailOptions = {
    from: '"Soleyah" <noreply@soleyah.com>',
    to: email,
    subject: 'Recuperación de contraseña - Soleyah',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Hola,</h2>
        <p>Has solicitado restablecer tu contraseña en Soleyah. Haz clic en el siguiente botón para continuar:</p>
        <a href="${resetUrl}" style="background-color: #007f5f; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Restablecer Contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste esto, puedes ignorar este correo.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

