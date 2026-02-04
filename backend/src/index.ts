import express, { Request, Response } from "express"
import connectDB from "./config/mongodb"
import dotenv from "dotenv"
import authRoutes from "./routes/authRoute";
import productRoutes from "./routes/productRoutes";
import cors from "cors";

dotenv.config()

const PORT = process.env.PORT

const app = express()
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Ruta de prueba para el Admin
app.get("/", (__, res) => {
  res.send("SeloYah ☀️    API funcionando correctamente");
});

app.listen(PORT, () => {
  console.log(`✅ Servidor en escucha en el puerto http://localhost:${PORT}`)
  connectDB()
})