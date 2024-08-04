import { connectDB, Meeting } from "./db";
import { DataMeeting } from "@/utils/interfaces";

// Define una interfaz para el tipo de datos de la reunión


export const saveMeeting = async (data: DataMeeting[]) => {
  const { who, when, what, since, until, about, duration } = data[0];
  /*
  console.log("data en actions: ", data);
  console.log("who:", who);
  console.log("when:", when);
  console.log("what", what)
  console.log("since:", since);
  console.log("until:", until);
  console.log("about:", about);
  console.log("duration:", duration);
*/
  try {
    await connectDB();
    //console.log("Conectado a la base de datos en saveMeeting");
    const newMeet = await Meeting.create({
      who,
      when,
      what,
      since,
      until,
      about,
      duration,
    });
    //console.log("newMeet------------------------------------------------------------------------------------------>", newMeet)
    return newMeet;
  } catch (error) {
    console.error("Error al crear la reunión:", error);
    throw error; // Opcionalmente, puedes lanzar el error para manejarlo en otros lugares
  }
};
