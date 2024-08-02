import { saveMeeting } from "@/lib/actions";
import { DataMeeting } from "@/utils/interfaces";

export async function POST(request: Request): Promise<Response> {
  "use server";
  const data: DataMeeting[] = await request.json();
  console.log("En tasks/route---------------------->", data);

  try {
    const newData = await saveMeeting(data);
    
    console.log("newData------------------------------------------------->",newData)

    const response = new Response(JSON.stringify(newData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    return new Response("Error al guardar la reunión", {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
