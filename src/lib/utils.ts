import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import lodash from 'lodash'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const debounce = lodash.debounce
