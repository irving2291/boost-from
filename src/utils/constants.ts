import type { RequestStatus } from '../types';

// API Configuration
export const API_BASE_URL = 'http://192.168.100.173:8080/api/v1';

// Request Status Configuration (Legacy - for backward compatibility)
export const REQUEST_STATUSES: RequestStatus[] = ['NEW', 'IN_PROGRESS', 'RECONTACT', 'WON', 'LOST'];

export const STATUS_LABELS: Record<RequestStatus, string> = {
  NEW: 'Nuevos',
  IN_PROGRESS: 'En Proceso',
  RECONTACT: 'Recontactar',
  WON: 'Ganados',
  LOST: 'Perdidos',
  CLOSE: 'Cerrados'
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  NEW: 'bg-slate-100 text-slate-700 border-slate-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  RECONTACT: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  WON: 'bg-green-50 text-green-700 border-green-200',
  LOST: 'bg-red-50 text-red-700 border-red-200',
  CLOSE: 'bg-gray-50 text-gray-700 border-gray-200'
};

// Valid status transitions (Legacy)
export const VALID_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  NEW: ['IN_PROGRESS', 'LOST'],
  IN_PROGRESS: ['RECONTACT', 'WON', 'LOST'],
  RECONTACT: ['IN_PROGRESS', 'WON', 'LOST'],
  WON: [], // No transitions allowed from WON
  LOST: [], // No transitions allowed from LOST
  CLOSE: [] // No transitions allowed from CLOSE
};

// Priority Configuration
export const PRIORITY_COLORS = {
  high: {
    bg: 'bg-accent-red',
    text: 'text-white',
    border: '#EF4444'
  },
  medium: {
    bg: 'bg-accent-yellow',
    text: 'text-white',
    border: '#F59E0B'
  },
  low: {
    bg: 'bg-accent-green',
    text: 'text-white',
    border: '#10B981'
  }
} as const;

// Schnauzer Pepper Color Palette
export const COLORS = {
  charcoal: '#1F2937',
  slateDark: '#374151',
  slate: '#4B5563',
  slateLight: '#6B7280',
  silver: '#9CA3AF',
  platinum: '#D1D5DB',
  pearl: '#F3F4F6',
  white: '#FFFFFF',
  accentBlue: '#3B82F6',
  accentGreen: '#10B981',
  accentRed: '#EF4444',
  accentYellow: '#F59E0B'
} as const;

// Layout Configuration
export const SIDEBAR_WIDTH = 256; // 16rem in pixels
export const HEADER_HEIGHT = 64; // 4rem in pixels

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300
} as const;