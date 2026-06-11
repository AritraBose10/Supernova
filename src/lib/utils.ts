import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function getStreakLabel(streak: number): string {
  if (streak >= 100) return "Century Streak!"
  if (streak >= 30) return "Monthly Champion"
  if (streak >= 7) return "Week Warrior"
  if (streak >= 3) return "On a Roll"
  if (streak >= 1) return "Getting Started"
  return "Start Today"
}
