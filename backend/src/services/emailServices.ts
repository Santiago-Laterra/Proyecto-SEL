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

export const notifyShippingUpdate = async (email: string, orderNumber: string, status: string) => {
  await resend.emails.send({
    from: 'SeloYah <onboarding@resend.dev>', // Por ahora usá este de prueba
    to: [email],
    subject: `Actualización de tu pedido ${orderNumber} - SeloYah`,
    html: `
      <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #1e293b;">¡Hola! Tu pedido ha cambiado de estado.</h2>
        <p>El pedido <strong>${orderNumber}</strong> ahora se encuentra:</p>
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 18px; text-align: center; font-weight: bold; color: #059669;">
          ${status.toUpperCase()}
        </div>
        <p style="margin-top: 20px;">Te avisaremos cuando haya más novedades. <br> <strong>SeloYah</strong></p>
      </div>
    `
  });
};