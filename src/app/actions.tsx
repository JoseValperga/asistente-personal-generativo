"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode } from "react";
import { z } from "zod";
import { generateId } from "ai";
import {
  messageSchema,
  whatSchema,
  whenSchema,
  whoSchema,
  timeSchemaSince,
  timeSchemaSinceUntil,
  aboutSchema,
  durationSchema,
} from "../utils/tools/toolSchemas/toolSchemas";

import dotenv from "dotenv";
import { checkAvailability, OverLap } from "@/utils/tools/checkAvailability";
import TaskList from "@/components/TaskList";
dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;

export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

export async function continueConversation(
  input: string
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState();

  const result = await streamUI({
    model: openai("gpt-4o"),

    messages: [...history.get(), { role: "user", content: input }],

    system: `You're a productivity assistant and manage a daily meeting schedule.
      You should keep in mind that you manage dates, times and duration of meetings.
      - You cannot schedule meetings on dates and times before the system time. 
      - If the date is not specified, take by default system time. 
      - You can schedule meetings, delete meetings, move meetings, modify meeting attendees, 
      modify the duration of meetings, modify the topics to be discussed during meetings.
      - Before scheduling a meeting, check if the time slot is available.
      - If the time slot is not available, respond with a message indicating the conflict but do not suggest an alternative time.
      - Use \`addMeeting\` to save meetings and not for other tasks and it will report you when end
      - Always return a response`,

    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: "assistant", content },
        ]);
      }
      return <div>{content}</div>;
    },

    tools: {
      addMeetingTool: {
        description:
          "Use to schedule a meeting. Returns true if it could, otherwise returns false",

        parameters: z.object({
          dataMeeting: z.object({
            message: messageSchema,
            what: whatSchema,
            who: whoSchema,
            when: whenSchema,
            since: timeSchemaSince,
            until: timeSchemaSinceUntil,
            about: aboutSchema,
            duration: durationSchema,
          }),
        }),

        generate: async ({ dataMeeting }) => {
          console.log("Estoy en generate", dataMeeting);
          history.done((messages: ServerMessage[]) => [
            ...messages,
            {
              role: "assistant",
              content: `Showing information`,
            },
          ]);

          const availability: OverLap[] = await checkAvailability(dataMeeting);

          if (availability.length === 1) {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/tasks`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(availability[0].overLap),
              }
            );
          }

          return <TaskList tasks={availability[0].overLap}  />;
        },
      },
    },
  });

  return {
    id: generateId(),
    role: "assistant",
    display: result.value,
  };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});
