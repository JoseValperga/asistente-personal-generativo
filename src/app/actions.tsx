"use server";

import { createStreamableValue } from "ai/rsc";
import { CoreMessage, generateText, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { addMeetingTool } from "@/utils/tools/addMeetingTool";

import dotenv from "dotenv";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;
const language = process.env.LANGUAGE;

export async function continueConversation(history: Message[]) {
  "use server";
  console.log("History------------------------->", history);

  const stream = createStreamableValue();

  (async () => {
    const result = await streamText({
      model: openai("gpt-4o"),

      messages: history,

      system: `You're a productivity assistant and manage a daily meeting schedule.
      You should keep in mind that you manage dates, times and duration of meetings. All answers must be in ${language}.
      - You cannot schedule meetings on dates and times before the system time. 
      - If the date is not specified, take by default system time. 
      - You can schedule meetings, delete meetings, move meetings, modify meeting attendees, 
      modify the duration of meetings, modify the topics to be discussed during meetings.
      - Before scheduling a meeting, check if the time slot is available.
      - If the time slot is not available, respond with a message indicating the conflict but do not suggest an alternative time.
      - Use \`addMeeting\` to save meetings and not for other tasks and it will report you when end
      - Always return a response`,
      temperature: 1,
      tools: {
        addMeeting: addMeetingTool,
      },
    });

    for await (const text of result.textStream) {
      stream.update(text);
    }
    console.log("Result------------------>", result);
    stream.done();
  })();
  console.log("STREAM--------------------->", stream.value);
  return { messages: history, newMessage: stream.value };

  /*
  const data = { test: "hello" };

  console.log("text", result.text);
  console.log("toolcalls", result.toolCalls);
  console.log("toolResult", result.toolResults);
  console.log("finishReason", result.finishReason);
  console.log("usage", result.usage);
*/
  //const stream = createStreamableValue(result.text).done();
  //const stream = createStreamableValue(result.text).done();
  //return { message: stream.value, data };
}
