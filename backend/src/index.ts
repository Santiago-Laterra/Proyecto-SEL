import express, { Request, Response } from "express"
import connectDB from "./config/mongodb"
import dotenv from "dotenv"

dotenv.config()

const PORT = process.env.PORT

const app = express()

app.listen(PORT, () => {
  console.log(`✅ Servidor en escucha en el puerto http://localhost:${PORT}`)
  connectDB()
})