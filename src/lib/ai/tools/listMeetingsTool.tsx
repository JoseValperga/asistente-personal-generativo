"use server";

import React, { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "@/utils/utils";
import { listMeetings } from "@/utils/tools/listMeetings";
import TaskList from "@/components/TaskList";
import { getMutableAIState } from "ai/rsc";
import { AI } from "../aicore";
import {
  whoSchema,
  whenSchemaListStart,
  whenSchemaListEnd,
  timeSchemaSince,
  timeSchemaSinceUntil,
  aboutSchema,
} from "../schemas";

// ✅ LoadingComponent válido con JSX
const LoadingComponent = (): JSX.Element => (
  <div className="animate-pulse p-4">Working, please wait...</div>
);

// ✅ Tool exportado modular y tipado
export const listMeetingsTool = {
  description:
    "List meetings or locate them. If the answer is empty, let us know that you don't have content for the year you're trying to list.",

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

  generate: async function* ({ listMeeting }: any): AsyncGenerator<ReactNode> {
    yield <LoadingComponent />;

    const toolCallId = nanoid();
    const history = getMutableAIState<typeof AI>();

    const meetings = await listMeetings(listMeeting);
    const meetingData = meetings.map((meeting) => meeting.dataValues);

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

    return <TaskList tasks={meetingData} />;
  },
};
