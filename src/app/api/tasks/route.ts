import { NextRequest } from "next/server";
import { saveMeeting } from "@/lib/actions";
import { connectDB } from "@/lib/db";
import { DataMeeting } from "@/utils/interfaces";

export async function POST(request: NextRequest) {
  "use server";

  try {
    await connectDB();
    const data: DataMeeting = await request.json();

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Invalid task data." }),
        { status: 400 }
      );
    }

    const newData = await saveMeeting(data);

    return new Response(JSON.stringify(newData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Error in POST /api/tasks:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500 }
    );
  }
}
