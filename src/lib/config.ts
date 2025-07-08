import dotenv from "dotenv";
dotenv.config();

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
  DATABASE_URL,
  NEXT_PUBLIC_BASE_URL,
  BASE_URL,
  OPENAI_API_KEY,
  PORT,
} = process.env;

// Validación básica
if (!OPENAI_API_KEY) {
  throw new Error("❌ Falta OPENAI_API_KEY en .env");
}
if (!BASE_URL || !NEXT_PUBLIC_BASE_URL) {
  throw new Error("❌ Faltan BASE_URL o NEXT_PUBLIC_BASE_URL en .env");
}

const IS_LOCAL = NEXT_PUBLIC_BASE_URL.includes("localhost");

// URL para conectar tu API (local o deploy)
const urlConnect = IS_LOCAL ? NEXT_PUBLIC_BASE_URL : BASE_URL;

// Para la base de datos
let connectionString: string | undefined;

if (IS_LOCAL) {
  if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_NAME) {
    throw new Error("❌ Faltan datos de DB para entorno local en .env");
  }
  connectionString = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;
} else {
  if (!DATABASE_URL) {
    throw new Error("❌ Falta DATABASE_URL para producción en .env");
  }
  connectionString = DATABASE_URL;
}

export {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
  DATABASE_URL,
  NEXT_PUBLIC_BASE_URL,
  BASE_URL,
  OPENAI_API_KEY,
  IS_LOCAL,
  urlConnect,
  connectionString,
  PORT,
};
