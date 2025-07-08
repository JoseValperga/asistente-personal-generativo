"use server";


import { z } from "zod";
import { nanoid } from "@/utils/utils";
import { checkAvailability, OverLap } from "@/utils/tools/checkAvailability";
import { messageSchema, whoSchema, whenSchemaAdd, timeSchemaSince, timeSchemaSinceUntil, aboutSchema, durationSchema } from "../schemas";
import TaskList from "@/components/TaskList";
import { ReactNode } from "react";
import { getMutableAIState } from "ai/rsc";
import { AI } from "../aicore";

const LoadingComponent = () => (
  <div className="animate-pulse p-4">working, please wait...</div>
);

export const addMeetingTool = {
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
  generate: async function* ({ dataMeeting }: any): AsyncGenerator<ReactNode> {
    yield <LoadingComponent />;
    const toolCallId = nanoid();
    const history = getMutableAIState<typeof AI>();

    const availability: OverLap[] = await checkAvailability(dataMeeting);
    let array: any[] = [];
    for (let i = 0; i < availability.length; i++) {
      array.push(availability[i].overLap[0]);
    }

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

    return <TaskList tasks={array} />;
  },
};
