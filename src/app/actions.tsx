"use server";

import {
  createAI,
  createStreamableValue,
  getMutableAIState,
  streamUI,
} from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode, useEffect } from "react";
import { any, z } from "zod";
import { generateId, CoreMessage } from "ai";
import { nanoid } from "@/utils/utils";
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
export type Message = CoreMessage & {
  id: string;
};

export type ServerMessage = {
  id: string;
  role: "user" | "assistant" | "function";
  content: Message[];
};

export type ClientMessage = {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}[];

export const AI = createAI<ServerMessage, ClientMessage>({
  actions: {
    continueConversation,
  },
  initialAIState: { role: "user", id: generateId(), content: [] },
  initialUIState: [],
});

const LoadingComponent = () => (
  <div className="animate-pulse p-4">working, please wait...</div>
);

let textStream = createStreamableValue("");

export async function continueConversation(
  input: string
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState<typeof AI>();

  history.update({
    ...history.get(),
    content: [
      ...history.get().content,
      {
        id: nanoid(),
        role: "user",
        content: input,
      },
    ],
  });
  
  const result = await streamUI({
    model: openai("gpt-4o"),

    messages: [
      ...history.get().content.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name,
      })),
    ],
    
    system: `You're a productivity assistant and manage a daily meeting schedule.
    You should keep in mind that you manage dates, times and duration of meetings.
    - You cannot schedule meetings on dates and times before the system time.  
    - If the date is not specified, take by default system time. 
    - You can schedule meetings, delete meetings, move meetings, modify meeting attendees, 
    modify the duration of meetings, modify the topics to be discussed during meetings.
    - Before scheduling a meeting, check if the time slot is available.
    - If the time slot is not available, respond with a message indicating the conflict but do not suggest an alternative time.
    - Use \`addMeeting\` to save meetings.You can only schedule one at a time.
    - If the user asks to schedule several meetings at once, or complete another impossible task, respond that you can't do it right now, but that you are working on implementing it.
    `,
    text: ({ content, done, delta }) => {
      textStream.update(content);
      if (done) {
        textStream.done();
        history.done({
          ...history.get(),
          content: [
            ...history.get().content,
            { id: nanoid(), role: "assistant", content },
          ],
        });
      } else {
        textStream.update(delta);
      }
      return <div>{content}</div>;
    },

    tools: {
      addMeetingTool: {
        description: "Schedule a meeting.",

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

        generate: async function* ({ dataMeeting }) {
          const availability: OverLap[] = await checkAvailability(dataMeeting);
          const toolCallId = nanoid();

          if (availability.length === 1 && availability[0].result) {
            const temp = availability[0].overLap;

            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/tasks`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(temp),
              }
            );
          }

          yield <LoadingComponent />;

          history.done({
            ...history.get(),
            content: [
              ...history.get().content,
              {
                id: nanoid(),
                role: "assistant",
                content: [
                  {
                    type: "tool-call",
                    toolName: "addMeetingTool",
                    toolCallId,
                    args: { dataMeeting },
                  },
                ],
              },
              {
                id: nanoid(),
                role: "tool",
                content: [
                  {
                    type: "tool-result",
                    toolName: "listStocks",
                    toolCallId,
                    result: availability,
                  },
                ],
              },
            ],
          });
          return <TaskList tasks={availability[0].overLap} />;
        },
      },
    },
  });

  return [
    {
      id: generateId(),
      role: "assistant",
      display: result.value,
    },
  ];
}
