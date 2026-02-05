import { Request, Response } from 'express'; // <--- Faltaba esta línea
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Product } from '../model/productModel';
import { Order } from '../model/orderModel';


// Configuramos Mercado Pago con tu Token del .env
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export const createPreference = async (req: Request, res: Response) => {
  try {
    // 1. Extraemos los datos del body (incluyendo dirección y userId)
    const { items, shippingAddress, shippingCost, userId } = req.body;

    // 2. Calculamos el monto total para guardarlo en nuestra DB
    const itemsTotal = items.reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0);
    const totalAmount = itemsTotal + (Number(shippingCost) || 0);

    // 3. CREAMOS LA ORDEN EN MONGODB (Estado inicial: pending)
    // Esto es lo que después verá la admin en su dashboard y exportará a Excel
    const newOrder = new Order({
      user: userId,
      items: items,
      shippingAddress: shippingAddress, // Calle, número, localidad, etc.
      shippingCost: Number(shippingCost) || 0,
      totalAmount: totalAmount,
      status: 'pending'
    });

    const savedOrder = await newOrder.save();

    // 4. PREPARAMOS LOS ITEMS PARA MERCADO PAGO
    const preference = new Preference(client);
    const allItems = [...items]; // Spread operator para copiar items

    // Sumamos el envío como un item más para que MP lo cobre
    if (shippingCost && shippingCost > 0) {
      allItems.push({
        title: "Costo de Envío (Logística SeloYah)",
        quantity: 1,
        unit_price: Number(shippingCost),
        currency_id: "ARS"
      });
    }

    // 5. CREAMOS LA PREFERENCIA EN MERCADO PAGO
    const result = await preference.create({
      body: {
        items: allItems,
        // IMPORTANTE: Guardamos el ID de la ORDEN, no del producto
        external_reference: savedOrder._id.toString(),
        back_urls: {
          success: "https://www.google.com",
          failure: "https://www.google.com",
          pending: "https://www.google.com"
        },
        auto_return: "approved"
      }
    });

    // 6. ACTUALIZAMOS LA ORDEN CON EL ID DE PREFERENCIA (Opcional, pero útil)
    savedOrder.mpPreferenceId = result.id!
    await savedOrder.save();

    // 7. RESPONDEMOS AL FRONTEND
    res.status(200).json({
      id: result.id,
      init_point: result.init_point,
      orderId: savedOrder._id // Para que el front sepa qué orden se generó
    });

  } catch (error: any) {
    console.error("Error al crear preferencia/orden:", error.message || error);
    res.status(500).json({
      message: "Error al procesar la compra",
      error: error.message
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