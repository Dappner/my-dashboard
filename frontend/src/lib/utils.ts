import { type ClassValue, clsx } from "clsx";
import { parse } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseDate(date: string) {
  return parse(date, "yyyy-MM-dd", new Date());
}
