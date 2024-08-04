import { customAlphabet } from "nanoid"

export const sleep = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))

export const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    7
  )