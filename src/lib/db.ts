import pg from "pg";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import MeetingModel from "./models/meeting";
import { EnvVariables } from "@/utils/interfaces";
dotenv.config();

const getEnvVariables = (): EnvVariables => {
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, NEXT_PUBLIC_BASE_URL } = process.env;

  if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_NAME || !NEXT_PUBLIC_BASE_URL) {
    throw new Error("Missing required environment variables");
  }

  return {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_NAME,
    NEXT_PUBLIC_BASE_URL
  };
};

const env = getEnvVariables();

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, NEXT_PUBLIC_BASE_URL } = env;
const temp2: string = `${NEXT_PUBLIC_BASE_URL}`

const temp: string = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;

const sequelize = new Sequelize(temp, {
  logging: false,
  native: false,
  dialectModule: pg,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  retry: {
    max: 3,
  },
});

MeetingModel(sequelize);

const { Meeting } = sequelize.models;

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { Meeting, connectDB };
