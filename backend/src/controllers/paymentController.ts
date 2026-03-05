import { Request, Response } from 'express'; // <--- Faltaba esta línea
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Order } from '../model/orderModel';


// Configuramos Mercado Pago con tu Token del .env
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export const createPreference = async (req: Request, res: Response) => {
  try {
    const { items, shippingAddress, shippingCost, userId, phoneNumber } = req.body;

    // 1. CALCULAMOS EL TOTAL REAL (Precio x Cantidad)
    const itemsTotal = items.reduce((acc: number, item: any) => acc + (Number(item.unit_price) * Number(item.quantity)), 0);
    const totalAmount = itemsTotal + (Number(shippingCost) || 0);

    const orderCount = await Order.countDocuments();
    const nextNumber = (orderCount + 1).toString().padStart(4, '0');
    const orderNumber = `SY-${nextNumber}`;

    // 2. CREAMOS LA ORDEN EN MONGODB (Corregido para guardar cantidad)
    const newOrder = new Order({
      user: userId,
      items: items.map((item: any) => ({
        title: item.title,
        price: Number(item.unit_price),
        quantity: Number(item.quantity) // <--- ESTO FALTABA
      })),
      shippingAddress,
      shippingCost: Number(shippingCost),
      totalAmount,
      orderNumber,
      phoneNumber,
      status: 'pending'
    });

    const savedOrder = await newOrder.save();

    // 3. PREFERENCIA DE MERCADO PAGO
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: items.map((item: any) => ({
          id: item.id || '',
          title: item.title,
          unit_price: Number(item.unit_price),
          quantity: Number(item.quantity), // <--- ESTO ASEGURA EL COBRO CORRECTO
          currency_id: 'ARS'
        })),
        back_urls: {
          success: `${process.env.FRONTEND_URL}/success`,
          failure: `${process.env.FRONTEND_URL}/cart`,
          pending: `${process.env.FRONTEND_URL}/cart`,
        },
        auto_return: 'approved',
        external_reference: savedOrder._id.toString(),
        notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      }
    });

    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la preferencia' });
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