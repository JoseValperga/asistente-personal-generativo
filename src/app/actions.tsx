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

export async function continueConversation(
  input: string
): Promise<ClientMessage> {
  "use server";

  let textStream = createStreamableValue("");
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

    system: `You are a helpful assistant. You manage daily meeting schedules and also other activities of any kind, as long as they are morally correct.
    - Answer greetings.
    - If today's date and time are not specified, take the system date and time by default. 
    - You can schedule meetings or activities, list meetings or activities, and locate meetings or activities.. 
    - You can't schedule meetings or activities on dates and times before the system time.  
    - You can't delete meetings or activities, move them, modify the attendees of them, modify their durations, or modify the topics that will be covered during meetings or activities that will take place.
    - Use \`addMeetingTool\` to save meetings or activities. If the user asks to schedule several meetings or activities at once, or complete another impossible task, respond that you can't do it right now, but that you are working on implementing it, and do not continue with that task.
    - Use \`listMeetingsTool\` to list meetings or actvities or to locate meetings or activities. 
    `,
    
    temperature: 0.5,

    text: ({ content, done, delta }) => {
      //textStream.update(content);
      /*console.log(
        "-------------------UPDATE TEXTSTREAM------------------------------------------"
      );
      console.log("DONE en text", done);
      console.log("CONTENT in text", content);
      console.log("DELTA en test", delta);
      console.log("HISTORY EN TEST", history.get())
      console.log();*/
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
        textStream.update(delta); /*
        console.log(
          "***************UPDATE DELTA*********************************"
        );
        console.log("DONE en textStream", done);
        console.log("CONTENT in textStream", content);
        console.log("DELTA en testStream", delta);
        console.log("HISTORY EN TESTSTREAM", history.get())*/
      }
      return <div>{content}</div>;
    },

    tools: {
      addMeetingTool: {
        description: "Schedule meetings or activities",

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
          const toolCallId = nanoid();
          const availability: OverLap[] = await checkAvailability(dataMeeting);

          let array: any[] = [];

          for (let i = 0; i < availability.length; i++) {
            let temp = availability[i].overLap[0];

            array.push(temp);
          }

          //sleep(500);
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
                    result: array,
                  },
                ],
              },
            ],
          });
          console.log("------------------EN ADDMEETINGS-----------------");
          console.log("HISTORY GET EN TESTSTREAM", history.get());
          return <TaskList tasks={array} />;
        },
      },

      listMeetingsTool: {
        description: "List meetings or to locate meetings",

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
          const meetings = await listMeetings(listMeeting);
          const meetingData = meetings.map((meeting) => meeting.dataValues);
          //sleep(500);
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
                    result: meetingData,
                  },
                ],
              },
            ],
          });
          //console.log("------------------EN LIST-----------------");
          //console.log("HISTORY GET EN TESTSTREAM", history.get());

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
