import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: "second" },   // até 60s → segundos
    { amount: 60, unit: "minute" },   // até 60m → minutos
    { amount: 24, unit: "hour" },     // até 24h → horas
    { amount: 30, unit: "day" },      // até 30d → dias
    { amount: 12, unit: "month" },    // até 12m → meses
    { amount: Infinity, unit: "year" } // depois → anos
  ];

  let duration = diffInSeconds;
  for (let i = 0; i < divisions.length; i++) {
    const division = divisions[i];
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return "";
}
export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};