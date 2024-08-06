import pg from "pg";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import MeetingModel from "./models/meeting";
import { EnvVariables } from "@/utils/interfaces";
dotenv.config();

const getEnvVariables = (): EnvVariables => {
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, NEXT_PUBLIC_BASE_URL } =
    process.env;

  if (
    !DB_USER ||
    !DB_PASSWORD ||
    !DB_HOST ||
    !DB_NAME ||
    !NEXT_PUBLIC_BASE_URL
  ) {
    throw new Error("Missing required environment variables");
  }

  return {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_NAME,
    NEXT_PUBLIC_BASE_URL,
  };
};

const env = getEnvVariables();

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, NEXT_PUBLIC_BASE_URL } = env;
//const temp2: string = `${NEXT_PUBLIC_BASE_URL}`

let temp: string;

if (NEXT_PUBLIC_BASE_URL === "http://localhost:3000") {
  temp = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;
} else {
  temp = NEXT_PUBLIC_BASE_URL;
}
const sequelize = new Sequelize(temp, {
  logging: false,
  native: false,
  dialectModule: pg,
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
