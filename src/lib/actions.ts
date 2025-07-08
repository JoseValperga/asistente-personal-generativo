import { connectDB, Meeting } from "./db";
import { DataMeeting } from "@/utils/interfaces";

/**
 * Guarda una reunión en la base de datos.
 * Valida los datos antes de insertar.
 */
export const saveMeeting = async (data: DataMeeting) => {
  const { who, when, since, until, about, duration } = data;

  // Validación básica
  if (!who || !when || !since || !until || !about || !duration) {
    throw new Error("❌ Missing required fields for meeting.");
  }

  try {
    await connectDB();

    const newMeet = await Meeting.create({
      who,
      when,
      since,
      until,
      about,
      duration,
    });

    // Solo devolvemos los datos esenciales
    return newMeet.toJSON();

  } catch (error) {
    console.error("❌ Error saving meeting:", error);
    throw new Error("❌ Failed to save meeting. Please try again.");
  }
};
