import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "01".."99" */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
