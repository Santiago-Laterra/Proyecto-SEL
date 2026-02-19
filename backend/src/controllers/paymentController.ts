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

    console.log("=== 1. DATOS RECIBIDOS DEL FRONTEND ===");
    const itemsTotal = items.reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0);
    const totalAmount = itemsTotal + (Number(shippingCost) || 0);

    // LÓGICA DEL CONTADOR
    const orderCount = await Order.countDocuments(); // Cuenta cuántas hay
    const nextNumber = (orderCount + 1).toString().padStart(4, '0');
    const orderNumber = `SY-${nextNumber}`;

    // 1. CREAMOS LA ORDEN EN MONGODB
    console.log("=== 2. INTENTANDO GUARDAR ORDEN EN MONGO ===");
    const newOrder = new Order({
      user: userId,
      items: items,
      shippingAddress: shippingAddress,
      shippingCost: Number(shippingCost) || 0,
      totalAmount: totalAmount,
      status: 'pending',
      orderNumber: orderNumber, // Guardamos el número nuevo
      shippingStatus: 'Por empaquetar', // Estado inicial por defecto
      phoneNumber: req.body.phoneNumber
    });

    const savedOrder = await newOrder.save();
    console.log("Orden guardada con ID:", savedOrder._id);

    // 2. PREPARAMOS LOS ITEMS
    const preference = new Preference(client);

    // Aseguramos que los números sean números
    const allItems = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity),
      currency_id: "ARS"
    }));

    if (shippingCost && shippingCost > 0) {
      allItems.push({
        title: "Costo de Envío",
        quantity: 1,
        unit_price: Number(shippingCost),
        currency_id: "ARS"
      });
    }

    // 3. CREAMOS LA PREFERENCIA
    console.log("=== 3. LLAMANDO A MERCADO PAGO API ===");

    // Quitamos 'auto_return' para debuggear si ese es el bloqueo real
    const result = await preference.create({
      body: {
        items: allItems,
        external_reference: savedOrder._id.toString(),
        back_urls: {
          success: "https://seloyah.vercel.app/pago-exitoso",
          failure: "https://seloyah.vercel.app/carrito",
          pending: "https://seloyah.vercel.app/pago-pendiente"
        },
        auto_return: "approved"
      }
    });

    console.log("Respuesta de MP recibida. ID de Preferencia:", result.id);

    // 4. GUARDAMOS EL ID DE PREFERENCIA
    savedOrder.mpPreferenceId = result.id!;
    await savedOrder.save();
    console.log("Orden actualizada con ID de MP.");

    res.status(200).json({
      id: result.id,
      init_point: result.init_point,
      orderId: savedOrder._id
    });

  } catch (error: any) {
    console.error("=== ❌ ERROR DETALLADO DE MERCADO PAGO ===");

    // Esto te va a decir exactamente qué campo está mal (ej: "item.unit_price invalid")
    if (error.apiResponse && error.apiResponse.body) {
      console.log("Causa del rechazo:", JSON.stringify(error.apiResponse.body.cause, null, 2));
      console.log("Mensaje de MP:", error.apiResponse.body.message);
    } else {
      console.error("Error general:", error.message);
    }

    res.status(500).json({
      message: "Error al procesar la compra",
      mpError: error.apiResponse?.body || error.message
    });
  }
}

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
        const dbStatus = (status === "approved") ? 'approved' : 'pending';

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