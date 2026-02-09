import { Request, Response } from 'express'; // <--- Faltaba esta línea
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Order } from '../model/orderModel';


// Configuramos Mercado Pago con tu Token del .env
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export const createPreference = async (req: Request, res: Response) => {
  try {
    const { items, shippingAddress, shippingCost, userId } = req.body;

    const itemsTotal = items.reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0);
    const totalAmount = itemsTotal + (Number(shippingCost) || 0);

    // 1. CREAMOS LA ORDEN EN MONGODB (Estado inicial: pending)
    const newOrder = new Order({
      user: userId,
      items: items,
      shippingAddress: shippingAddress,
      shippingCost: Number(shippingCost) || 0,
      totalAmount: totalAmount,
      status: 'pending' // Estado por defecto para el Admin
    });

    const savedOrder = await newOrder.save();

    // 2. PREPARAMOS LOS ITEMS
    const preference = new Preference(client);
    const allItems = [...items];

    if (shippingCost && shippingCost > 0) {
      allItems.push({
        title: "Costo de Envío",
        quantity: 1,
        unit_price: Number(shippingCost),
        currency_id: "ARS"
      });
    }

    // 3. CREAMOS LA PREFERENCIA CON FILTRADO DE RETORNO
    const result = await preference.create({
      body: {
        items: allItems,
        external_reference: savedOrder._id.toString(),
        back_urls: {
          // ASEGÚRATE de que estas URLs existan en tu RouterApp.jsx
          success: "http://localhost:5173/pago-exitoso",
          failure: "http://localhost:5173/carrito",
          pending: "http://localhost:5173/pago-pendiente"

        },
        // Cambia "approved" por "all" para mayor compatibilidad en desarrollo
        auto_return: "approved",
      }
    });

    // 4. GUARDAMOS EL ID DE PREFERENCIA
    savedOrder.mpPreferenceId = result.id!;
    await savedOrder.save();

    res.status(200).json({
      id: result.id,
      init_point: result.init_point,
      orderId: savedOrder._id
    });

  } catch (error: any) {
    console.error("Error al crear preferencia/orden:", error.message || error);
    res.status(500).json({ message: "Error al procesar la compra", error: error.message });
  }
};

// --- EL WEBHOOK ---
export const receiveWebhook = async (req: Request, res: Response) => {
  try {
    const { query } = req;

    if (query.type === "payment") {
      const paymentId = query['data.id'] as string;
      const payment = await new Payment(client).get({ id: paymentId });

      const orderId = payment.external_reference;
      const status = payment.status;

      console.log(`Estado recibido de MP: ${status} para la orden: ${orderId}`);

      // 🛡️ FILTRO PROFESIONAL: Solo aceptamos estos dos estados
      if (status === "approved" || status === "pending" || status === "in_process") {

        // Mapeamos el status de MP a tu sistema de Admin
        const dbStatus = (status === "approved") ? 'paid' : 'pending';

        await Order.findByIdAndUpdate(orderId, {
          status: dbStatus,
          paymentId: paymentId // Guardamos el ID de pago por si el admin tiene que rastrear en MP
        });

        console.log(`Orden ${orderId} actualizada a: ${dbStatus}`);
      } else {
        // 🗑️ SI ES CANCELADO O RECHAZADO: 
        // No la actualizamos o podrías incluso borrarla si quieres limpiar la DB
        console.log(`El pago de la orden ${orderId} fue ${status}. No se marca como pagada.`);

        // OPCIONAL: Si quieres borrar la orden fallida para que no moleste al Admin
        // await Order.findByIdAndDelete(orderId);
      }
    }

    res.sendStatus(200);

  } catch (error: any) {
    console.error("Error en Webhook:", error.message || error);
    res.sendStatus(500);
  }
};