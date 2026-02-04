import { z } from 'zod';

export const productSchema = z.object({
  name: z.string()
    .min(3, "El nombre es muy corto (mínimo 3 caracteres)")
    .max(100, "El nombre es demasiado largo"),

  description: z.string()
    .min(10, "La descripción debe ser más detallada")
    .max(500, "Descripción demasiado extensa"),

  price: z.number()
    .positive("El precio debe ser un número mayor a 0"),

  stock: z.number()
    .int("El stock debe ser un número entero")
    .nonnegative("El stock no puede ser negativo"),

  category: z.string()
    .min(3, "La categoría es obligatoria")
    .optional() // Por si decides no usar categorías al principio
});