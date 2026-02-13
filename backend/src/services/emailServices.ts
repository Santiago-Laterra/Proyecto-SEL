import { Resend } from 'resend';

// Usamos la nueva variable que pondremos en Render
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetEmail = async (email: string, resetUrl: string) => {
  console.log("🚀 Enviando mail vía API de Resend a:", email);

  try {
    const data = await resend.emails.send({
      from: 'SeloYah <onboarding@resend.dev>', // Dominio temporal de prueba
      to: email,
      subject: 'Recuperación de contraseña - SeloYah',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #333;">Restablecer Contraseña</h2>
          <p>Hola, haz solicitado un cambio de clave para tu cuenta en Soleyah.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">CAMBIAR CONTRASEÑA</a>
          </div>
          <p style="font-size: 12px; color: #666;">Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.</p>
        </div>
      `,
    });

    console.log("✅ Mail entregado a la cola de Resend:", data);
    return data;
  } catch (error) {
    console.error("❌ Falló el envío por API:", error);
    throw error;
  }
};