import { z } from "zod";
import { tool } from "ai";
import { DataMeeting } from "../interfaces";
import { Meeting, connectDB } from "@/lib/db";
import { Op } from "sequelize";

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

export const checkAvailabilityTool = tool({
  description: "Use it to check availability of meeting times. Returns true if available, otherwise returns false",

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

  execute: async ({
    dataMeeting,
  }: {
    dataMeeting: DataMeeting;
  }): Promise<boolean> => {
    console.log("Estoy en checkAvailabilityTool")
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
        dataMeeting.until
      );

      const allOk = test1 && test2 && test3;

      return allOk;
    } catch (error) {
      console.error("Error en verificacion de disponibilidad", error);
      return false;
    }
  },
});

export const verifyMeetingAvailability = async (
  searchDate: string,
  startTime: string
) => {
  try {
    const overlappingMeetings = await Meeting.findAll({
      where: {
        when: searchDate,
        until: {
          [Op.lt]: startTime,
        },
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
        "Existen reuniones que comienzan a la misma hora de la nueva reunión:"
      ); //overlappingMeetings);
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
  endTime: string
) => {
  try {
    const conflictingMeetings = await Meeting.findAll({
      where: {
        when: searchDate,
        since: {
          [Op.lt]: endTime,
        },
      },
    });

    if (conflictingMeetings.length === 0) {
      console.log(
        "No hay reuniones que comiencen antes de la hora de finalización de la nueva reunión."
      );
      return true;
    } else {
      console.log(
        "Existen reuniones que comienzan antes de la hora de finalización de la nueva reunión:",
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
