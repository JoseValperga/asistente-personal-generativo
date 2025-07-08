import pg from "pg";
import { Sequelize, Options } from "sequelize";
import {
  IS_LOCAL,
  connectionString,
} from "@/lib/config";

import MeetingModel from "./models/meeting";
import MeetingCacheModel from "./models/meetings_cache";

// Configuración base de Sequelize
let sequelizeConfiguration: Options = {
  logging: false,
  native: false,
  dialectModule: pg,
};

// Ajuste especial para producción (SSL)
if (!IS_LOCAL) {
  sequelizeConfiguration = {
    ...sequelizeConfiguration,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: { acquire: 3000 },
    retry: { max: 5 },
  };
}

// Crear instancia de Sequelize
const sequelize = new Sequelize(connectionString!, sequelizeConfiguration);

// Importar modelos
MeetingModel(sequelize);
MeetingCacheModel(sequelize);

// Exportar modelos
const { Meeting, MeetingCache } = sequelize.models;

// Conexión a la DB
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ Conexión a la base de datos establecida correctamente.");
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
    throw error;
  }
};

export { Meeting, MeetingCache, connectDB };
