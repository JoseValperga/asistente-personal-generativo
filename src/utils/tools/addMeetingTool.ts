import { z } from "zod";
import ai from "ai";
import { tool } from "ai";
import { DataMeeting } from "../interfaces";
import {
  messageSchema,
  whatSchema,
  whenSchema,
  whoSchema,
  timeSchemaSince,
  timeSchemaSinceUntil,
  aboutSchema,
  durationSchema,
} from "./toolSchemas/toolSchemas";
import dotenv from "dotenv";
dotenv.config();

export const addMeetingTool = tool({
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

  execute: async ({ dataMeeting }: { dataMeeting: DataMeeting }) => {
    console.log("Estoy en generate", dataMeeting);
    let test1: boolean = false;
    let test2: boolean = false;
    let test3: boolean = false;

    try {
      await connectDB();
      test1 = await verifyMeetingAvailability(
        dataMeeting.when,
        dataMeeting.since
      );

      test2 = await verifyUniqueStartTime(dataMeeting.when, dataMeeting.since);

      test3 = await verifyEndTimeBeforeOtherStartTimes(
        dataMeeting.when,
        dataMeeting.until,
        dataMeeting.since
      );

      const allOk = test1 && test2 && test3;

      if (allOk) {
        const array: any[] = [];
        array.push(dataMeeting);
        (async () => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/tasks`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(array[0]),
            }
          );
        })();

        return { success: true, dataMeeting };
      } else {
        return {
          sucess: false,
        };
      }
    } catch (error) {
      console.error("Error en generacion", error);
      throw error;
    }
  },
});

//Verificar que hora de finalizacion de otras reuniones sean menores a hora de comienzo de nueva reunion

import { Meeting, connectDB } from "@/lib/db";
import { Op } from "sequelize";

export const verifyMeetingAvailability = async (
  searchDate: string,
  startTime: string
) => {
  try {
    const overlappingMeetings = await Meeting.findAll({
      where: {
        when: searchDate,

        [Op.and]: [
          {
            since: {
              [Op.lt]: startTime,
            },
          },
          {
            until: {
              [Op.gt]: startTime,
            },
          },
        ],

        /*
        until: {
          [Op.gt]: startTime,
        },*/
      },
    });

    if (overlappingMeetings.length === 0) {
      console.log(
        "No hay reuniones que terminen después de la hora de comienzo de la nueva reunión."
      );
      return true;
    } else {
      console.log(
        "Existen reuniones que terminan después de la hora de comienzo de la nueva reunión:",
        overlappingMeetings,
        searchDate,
        startTime
      );
      return false;
    }
  } catch (error) {
    console.error("Error verifying meeting availability:", error);
    return false;
  }
};

//Verificar que hora de comienzo de nueva reunion sea distinta a hora de comienzo de otras reuniones

export const verifyUniqueStartTime = async (
  searchDate: string,
  startTime: string
) => {
  try {
    const overlappingMeetings = await Meeting.findAll({
      where: {
        when: searchDate,
        since: startTime,
      },
    });

    if (overlappingMeetings.length === 0) {
      console.log(
        "No hay reuniones que comiencen a la misma hora de la nueva reunión."
      );
      return true;
    } else {
      console.log(
        "Existen reuniones que comienzan a la misma hora de la nueva reunión:",
        overlappingMeetings
      );
      return false;
    }
  } catch (error) {
    console.error("Error verifying unique start time:", error);
    return false;
  }
};

//Verificar que hora de finalizacion de nueva reunion sea menor de hora de comienzo de otras reuniones

const verifyEndTimeBeforeOtherStartTimes = async (
  searchDate: string,
  endTime: string,
  startTime: string
): Promise<boolean> => {
  try {
    const conflictingMeetings = await Meeting.findAll({
      where: {
        when: searchDate,
        [Op.and]: [
          {
            since: {
              [Op.lt]: endTime,
            },
          },
          {
            since: {
              [Op.gt]: startTime,
            },
          },
        ],
      },
    });

    if (conflictingMeetings.length === 0) {
      console.log(
        "No hay reuniones que comiencen antes de la hora de finalización de la nueva reunión ni reuniones que comiencen después de la hora de inicio de la nueva reunión."
      );
      return true;
    } else {
      console.log(
        "Existen reuniones que entran en conflicto con la nueva reunión:",
        conflictingMeetings
      );
      return false;
    }
  } catch (error) {
    console.error("Error verifying end time before other start times:", error);
    return false;
  }
};

export default verifyEndTimeBeforeOtherStartTimes;

//Si se cumplen 1 y 2 y 3 agendar reunion
