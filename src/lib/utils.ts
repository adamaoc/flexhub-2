import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Session management utilities
export function getSessionTimeRemaining(authTime: number): number {
  const sessionMaxAge = 48 * 60 * 60 // 48 hours in seconds
  const now = Math.floor(Date.now() / 1000)
  const elapsed = now - authTime
  return Math.max(0, sessionMaxAge - elapsed)
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "Expired"
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  } else {
    return `${minutes}m remaining`
  }
}

export function isSessionExpired(authTime: number): boolean {
  const sessionMaxAge = 48 * 60 * 60 // 48 hours in seconds
  const now = Math.floor(Date.now() / 1000)
  return (now - authTime) > sessionMaxAge
}
