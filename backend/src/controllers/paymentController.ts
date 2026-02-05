import { Request, Response } from 'express'; // <--- Faltaba esta línea
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Product } from '../model/productModel';


// Configuramos Mercado Pago con tu Token del .env
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export const createPreference = async (req: Request, res: Response) => {
  try {
    console.log("Intentando crear preferencia con:", req.body);
    const { items } = req.body;

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items,
        back_urls: {
          success: "https://www.google.com", // Usamos google solo para testear que pase
          failure: "https://www.google.com",
          pending: "https://www.google.com"
        },
        auto_return: "approved"
      }
    });

    res.status(200).json({
      id: result.id,
      init_point: result.init_point
    });

  } catch (error: any) {
    // Esto nos va a mostrar TODO el error en la terminal si vuelve a fallar
    console.error("Error al crear preferencia:", error.message || error);
    res.status(500).json({
      message: "Error en Mercado Pago",
      error: error.message,
      detail: error.cause // Agregamos detalle para ver qué dice MP
    });
  }
};

// --- EL WEBHOOK ---
export const receiveWebhook = async (req: Request, res: Response) => {
  try {
    const { query } = req;

    // Verificamos que sea una notificación de pago
    if (query.type === "payment") {
      const paymentId = query['data.id'] as string;

      // 1. Consultar el estado del pago a Mercado Pago
      const payment = await new Payment(client).get({ id: paymentId });

      if (payment.status === "approved") {
        const productId = payment.external_reference; // Recuperamos el ID que guardamos antes

        console.log(`Pago aprobado para el producto: ${productId}`);

        /* // Lógica para descontar stock en MongoDB:
        const product = await Product.findById(productId);
        if (product && product.stock > 0) {
          product.stock -= 1; // O la cantidad que venga en el item
          await product.save();
          console.log("Stock actualizado con éxito.");
        }
        */
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("Error en Webhook:", error);
    res.sendStatus(500);
  }
};