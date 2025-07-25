import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { RequestStatus } from '../types';
import { VALID_TRANSITIONS } from './constants';

// Utility for conditional class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Date formatting utilities
export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: es });
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
}

// Status validation utilities
export function isValidTransition(fromStatus: RequestStatus, toStatus: RequestStatus): boolean {
  return VALID_TRANSITIONS[fromStatus].includes(toStatus);
}

export function getValidTransitions(status: RequestStatus): RequestStatus[] {
  return VALID_TRANSITIONS[status];
}

// String utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Number formatting utilities
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage utilities
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Ha ocurrido un error inesperado';
}

// Array utilities
export function groupBy<T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const group = key(item);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}