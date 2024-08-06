
import { DataMeeting } from "../interfaces";
import { Meeting, connectDB } from "@/lib/db";
import { Op } from "sequelize";
//import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config();
const {NEXT_PUBLIC_BASE_URL} = process.env

export interface OverLap {
  overLap: DataMeeting[];
  result: boolean;
  response: string;
}
export const blankData: DataMeeting[] = [
  {
    message: " ",
    who: " ",
    when: " ",
    since: " ",
    until: " ",
    about: " ",
    duration: " ",
  },
];

export const checkAvailability = async (
  dataMeeting: DataMeeting
): Promise<OverLap[]> => {
  'use server'

  const array: OverLap[] = [];

  const helperTest: OverLap = {
    overLap: blankData,
    response: " ",
    result: false,
  };

  try {
    await connectDB();
    const test1: OverLap = await verifyMeetingAvailability(dataMeeting);
    const test2: OverLap = await verifyUniqueStartTime(dataMeeting);
    const test3: OverLap = await verifyEndTimeBeforeOtherStartTimes(
      dataMeeting
    );

    if (test1.result && test2.result && test3.result) {
      array.push(test1);
      const temp = array[0].overLap[0];
      const response = await fetch(
        `${NEXT_PUBLIC_BASE_URL}/api/tasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(temp),
        }
      );
      return array;
    }

    if (test1.result === false) {
      test1.overLap.forEach((elemento) => {
        elemento.message = test1.response;
        array.push(test1);
      });
    }

    if (test2.result === false) {
      test2.overLap.forEach((elemento) => {
        elemento.message = test2.response;
        array.push(test2);
      });
    }

    if (test3.result === false) {
      test1.overLap.forEach((elemento) => {
        elemento.message = test3.response;
        array.push(test3);
      });
    }
    return array;
  } catch (error) {
console.log("ERROR", error)
    throw new Error("Error en verificacion de disponibilidad");
  }
};

//Verificar que hora de finalizacion de otras reuniones sean menores a hora de comienzo de nueva reunion
export const verifyMeetingAvailability = async (
  dataMeeting: DataMeeting
): Promise<OverLap> => {
  const searchDate = dataMeeting.when;
  const startTime = dataMeeting.since;

  try {
    const overLappingMeetings = await Meeting.findAll({
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
      },
    });

    if (overLappingMeetings.length === 0) {
      const array: DataMeeting[] = [];
      array.push(dataMeeting);
      return {
        overLap: array,
        result: true,
        response:
          "No hay reuniones que terminen después de la hora de comienzo de la nueva reunión.",
      };
    } else {
      const overLappingDataMeetings = overLappingMeetings.map((meeting) => {
        const meetingData = meeting.get() as DataMeeting;
        return {
          message: meetingData.message,
          who: meetingData.who,
          when: meetingData.when,
          since: meetingData.since,
          until: meetingData.until,
          about: meetingData.about,
          duration: meetingData.duration,
        };
      });

      return {
        overLap: overLappingDataMeetings,
        result: false,
        response:
          "Existen reuniones que terminan después de la hora de comienzo de la nueva reunión:",
      };
    }
  } catch (error) {
    throw new Error("Error verifying meeting availability:");
  }
};

//Verificar que hora de comienzo de nueva reunion sea distinta a hora de comienzo de otras reuniones
export const verifyUniqueStartTime = async (
  dataMeeting: DataMeeting
): Promise<OverLap> => {
  const searchDate = dataMeeting.when;
  const startTime = dataMeeting.since;

  try {
    const overLappingMeetings = await Meeting.findAll({
      where: {
        when: searchDate,
        since: startTime,
      },
    });

    if (overLappingMeetings.length === 0) {
      return {
        overLap: [],
        result: true,
        response:
          "No hay reuniones que comiencen a la misma hora de la nueva reunión.",
      };
    } else {
      const overLappingDataMeetings = overLappingMeetings.map((meeting) => {
        const meetingData = meeting.get() as DataMeeting;
        return {
          message: meetingData.message,
          who: meetingData.who,
          when: meetingData.when,
          since: meetingData.since,
          until: meetingData.until,
          about: meetingData.about,
          duration: meetingData.duration,
        };
      });

      return {
        overLap: overLappingDataMeetings,
        result: false,
        response:
          "Existen reuniones que comienzan a la misma hora de la nueva reunión:",
      };
    }
  } catch (error) {
    throw new Error("Error verifying meeting availability:");
  }
};

//Verificar que hora de finalizacion de nueva reunion sea menor de hora de comienzo de otras reuniones
const verifyEndTimeBeforeOtherStartTimes = async (
  dataMeeting: DataMeeting
): Promise<OverLap> => {
  const searchDate = dataMeeting.when;
  const startTime = dataMeeting.since;
  const endTime = dataMeeting.until;
  try {
    const overLappingMeetings = await Meeting.findAll({
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

    if (overLappingMeetings.length === 0) {
      return {
        overLap: [],
        result: true,
        response:
          "No hay reuniones que comiencen antes de la hora de finalización de la nueva reunión",
      };
    } else {
      const overLappingDataMeetings = overLappingMeetings.map((meeting) => {
        const meetingData = meeting.get() as DataMeeting;
        return {
          message: meetingData.message,
          who: meetingData.who,
          when: meetingData.when,
          since: meetingData.since,
          until: meetingData.until,
          about: meetingData.about,
          duration: meetingData.duration,
        };
      });

      return {
        overLap: overLappingDataMeetings,
        result: false,
        response:
          "Existen reuniones que entran en conflicto con la nueva reunión:",
      };
    }
  } catch (error) {
    //("Error verifying meeting availability:", error);
    throw new Error("Error verifying meeting availability:");
  }
};

export default verifyEndTimeBeforeOtherStartTimes;

//Si se cumplen 1 y 2 y 3 agendar reunion
