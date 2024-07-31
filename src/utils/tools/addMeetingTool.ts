import { z } from "zod";
import ai from "ai";
import { tool } from "ai";
import { DataMeeting } from "../interfaces";
import { checkAvailability, Overlap } from "./checkAvailability";

import { ServerMessage } from "@/app/actions";
import TaskItem from "@/components/TaskItem";

import dotenv from "dotenv";
dotenv.config();

export const addMeetingTool = {
};
