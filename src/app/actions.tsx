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
import { nanoid, sleep } from "@/utils/utils";
import {
  messageSchema,
  whenSchemaListStart,
  whenSchemaListEnd,
  whoSchema,
  timeSchemaSince,
  timeSchemaSinceUntil,
  aboutSchema,
  durationSchema,
  whenSchemaAdd,
} from "../utils/tools/toolSchemas/toolSchemas";

import dotenv from "dotenv";
import { checkAvailability, OverLap } from "@/utils/tools/checkAvailability";
import TaskList from "@/components/TaskList";
import { DataMeeting } from "../utils/interfaces";
import { listMeetings } from "@/utils/tools/listMeetings";
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

    //- Before scheduling a meeting, check if the time slot is available.
    //  - If the time slot is not available, respond with a message indicating the conflict but do not suggest an alternative time.

    system: `You're a productivity assistant and manage a daily meeting schedule.
    You should keep in mind that you manage dates, times and duration of meetings.
    - Answer greetings.
    - You cannot schedule meetings on dates and times before the system time.  
    - If the date is not specified, take by default system time. 
    - You can schedule meetings, delete meetings, move meetings, modify meeting attendees, 
    modify the duration of meetings, modify the topics to be discussed during meetings.
    - Use \`addMeetingTool\` to save meetings. If the user asks to schedule several meetings at once, or complete another impossible task, respond that you can't do it right now, but that you are working on implementing it, and do not continue with that task.
    - Use \`listMeetingsTool\` to list meetings. 
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
        description: "Schedule meetings.",

        parameters: z.object({
          dataMeeting: z.object({
            message: messageSchema,
            who: whoSchema,
            when: whenSchemaAdd,
            since: timeSchemaSince,
            until: timeSchemaSinceUntil,
            about: aboutSchema,
            duration: durationSchema,
          }),
        }),

        generate: async function* ({ dataMeeting }) {
          yield <LoadingComponent />;
          let onFinish: boolean = false;
          const toolCallId = nanoid();
          const availability: OverLap[] = await checkAvailability(dataMeeting);

          let array: any[] = [];

          for (let i = 0; i < availability.length; i++) {
            let temp = availability[i].overLap[0];

            array.push(temp);
          }
          sleep(500);
          onFinish = true;
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
                    toolName: "addMeetingTool",
                    toolCallId,
                    result: onFinish === true,
                  },
                ],
              },
            ],
          });

          return <TaskList tasks={array} />;
        },
      },

      listMeetingsTool: {
        description: "List meetings",

        parameters: z.object({
          listMeeting: z.object({
            who: whoSchema,
            when: whenSchemaListStart,
            whenEnd: whenSchemaListEnd,
            since: timeSchemaSince,
            until: timeSchemaSinceUntil,
            about: aboutSchema,
          }),
        }),

        generate: async function* ({ listMeeting }) {
          yield <LoadingComponent />;
          const toolCallId = nanoid();
          let onFinish: boolean = false;
          const meetings = await listMeetings(listMeeting);
          const meetingData = meetings.map((meeting) => meeting.dataValues);
          onFinish = true;
          sleep(500);
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
                    toolName: "listMeetingsTool",
                    toolCallId,
                    args: { listMeeting },
                  },
                ],
              },
              {
                id: nanoid(),
                role: "tool",
                content: [
                  {
                    type: "tool-result",
                    toolName: "listMeetingsTool",
                    toolCallId,
                    result: onFinish === true,
                  },
                ],
              },
            ],
          });

          return <TaskList tasks={meetingData} />;
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
