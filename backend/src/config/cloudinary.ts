import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Usamos la memoria del servidor temporalmente
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Función para subir a Cloudinary manualmente
export const uploadToCloudinary = async (fileBuffer: Buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'SeloYah_Products' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(fileBuffer);
  });
};