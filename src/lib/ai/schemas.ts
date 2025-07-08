import { z } from "zod";

// Validación de mensajes (texto libre)
export const messageSchema = z.string();

// Quién participa
export const whoSchema = z.string();

// Fechas y tiempos
export const whenSchemaAdd = z.string();
export const whenSchemaListStart = z.string().optional();
export const whenSchemaListEnd = z.string().optional();
export const timeSchemaSince = z.string().optional();
export const timeSchemaSinceUntil = z.string().optional();

// Descripción / Tema
export const aboutSchema = z.string();

// Duración opcional
export const durationSchema = z.string().optional();
