import pg from "pg";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import MeetingModel from "./models/meeting";
import MeetingCacheModel from "./models/meetings-cache";
import { EnvVariables } from "@/utils/interfaces";

dotenv.config();

const getEnvVariables = (): EnvVariables => {
  const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_NAME,
    NEXT_PUBLIC_BASE_URL,
    BASE_URL,
  } = process.env;

  if (
    !DB_USER ||
    !DB_PASSWORD ||
    !DB_HOST ||
    !DB_NAME ||
    !NEXT_PUBLIC_BASE_URL ||
    !BASE_URL
  ) {
    throw new Error("Missing required environment variables");
  }

  return {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_NAME,
    NEXT_PUBLIC_BASE_URL,
    BASE_URL,
  };
};

const env = getEnvVariables();

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
  NEXT_PUBLIC_BASE_URL,
  BASE_URL,
} = env;

let temp: string;
let sequelizeConfiguration: object = {};

if (NEXT_PUBLIC_BASE_URL === "http://localhost:3000") {
  temp = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;
  sequelizeConfiguration = {
    logging: false,
    native: false,
    dialectModule: pg,
  };
} else {
  temp = NEXT_PUBLIC_BASE_URL;
  sequelizeConfiguration = {
    logging: false,
    native: false,
    dialectModule: pg,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      acquire: 3000,
    },
    retry: {
      max: 5,
    },
  };
}
const sequelize = new Sequelize(temp, sequelizeConfiguration);

MeetingModel(sequelize);
MeetingCacheModel(sequelize);

const { Meeting, MeetingCache } = sequelize.models;

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { Meeting, MeetingCache, connectDB };
