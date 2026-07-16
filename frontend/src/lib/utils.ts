import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | string) {
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("id-ID").format(value);
}

export function priorityTone(priority: string) {
  if (priority === "Critical") return "bg-danger/10 text-danger border-danger/20";
  if (priority === "High") return "bg-warning/10 text-warning border-warning/20";
  if (priority === "Medium") return "bg-secondary/10 text-secondary border-secondary/20";
  return "bg-success/10 text-success border-success/20";
}
