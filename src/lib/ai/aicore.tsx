"use server";

import React from "react";
import {
  createAI,
  createStreamableValue,
  getMutableAIState,
  streamUI,
} from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode } from "react";
import { nanoid } from "@/utils/utils";
import { generateId, CoreMessage } from "ai";

// Importa tus tools modularizadas
import { addMeetingTool } from "./tools/addMeetingTool";
import { listMeetingsTool } from "./tools/listMeetingsTool";

// IMPORTANTE: Define tu system prompt
const SYSTEM_PROMPT = `
You are a helpful assistant. You manage daily meeting schedules and other activities, as long as they are morally correct.
- Respond to greetings.
- Use the system's current date and time.
- You can schedule meetings or activities, list meetings or activities, and locate meetings or activities.
- You cannot schedule meetings or activities on dates and times earlier than the system's current time.
- You cannot delete meetings or activities, move them, modify their attendees, change their durations, or alter the topics to be covered during meetings or activities.
- If the user asks to complete another impossible task, respond that you can't do it right now.
- Use the \`addMeetingTool\` to save meetings or activities. If the user asks to schedule multiple meetings or activities at once, respond that you can't do it right now, but that you are working on implementing it, and do not proceed with that task.
- Use the \`listMeetingsTool\` to list meetings or activities, or to locate meetings or activities.
`;

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
    messages: history.get().content.map((message: any) => ({
      role: message.role,
      content: message.content,
      name: message.name,
    })),
    system: SYSTEM_PROMPT,
    temperature: 0.7,

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
      addMeetingTool,
      listMeetingsTool,
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
