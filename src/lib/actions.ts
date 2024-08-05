import { connectDB, Meeting } from "./db";
import { Op } from "sequelize";
import { DataMeeting } from "@/utils/interfaces";
// Define una interfaz para el tipo de datos de la reunión

export const saveMeeting = async (data: DataMeeting[]) => {
  const { who, when, since, until, about, duration } = data[0];

  try {
    const newMeet = await Meeting.create({
      who,
      when,
      since,
      until,
      about,
      duration,
    });
    return newMeet;
  } catch (error) {
    console.error("Error al crear la reunión:", error);
    throw error;
  }
};