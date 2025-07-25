import React from 'react';
import { cn } from '../../utils';
import type { RequestStatus } from '../../types';
import { STATUS_COLORS } from '../../utils/constants';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  status?: RequestStatus;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', status, size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center rounded-full font-medium transition-colors';
    
    const variants = {
      default: 'bg-slate-100 text-slate-800 border border-slate-200',
      secondary: 'bg-slate-50 text-slate-600 border border-slate-100',
      success: 'bg-green-50 text-green-700 border border-green-200',
      warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      danger: 'bg-red-50 text-red-700 border border-red-200',
      outline: 'border border-slate-300 text-slate-700 bg-transparent',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    };

    // If status is provided, use status-specific styling
    const statusStyle = status ? STATUS_COLORS[status] : '';

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          status ? statusStyle : variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };