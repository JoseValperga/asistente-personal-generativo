import { saveMeeting } from "@/lib/actions";
import { connectDB } from "@/lib/db";
import { DataMeeting } from "@/utils/interfaces";

export async function POST(request: Request): Promise<Response> {
  "use server";
  await connectDB();
  const data: DataMeeting = await request.json();

  console.log ("ESTOY EN SAVE", data)

  try {
    const newData = await saveMeeting(data);
    const response = new Response(JSON.stringify(newData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.log("ERROR",error)
    return new Response("Error al guardar la reunión", {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
