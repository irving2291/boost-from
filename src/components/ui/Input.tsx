import React from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { cn } from '../../utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'search';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    
    const variants = {
      default: '',
      search: 'pl-10',
    };

    const inputClasses = cn(
      baseStyles,
      variants[variant],
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      leftIcon && !variant && 'pl-10',
      rightIcon && 'pr-10',
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {/* Left Icon */}
          {(leftIcon || variant === 'search') && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {variant === 'search' ? (
                <MagnifyingGlass size={16} />
              ) : (
                leftIcon
              )}
            </div>
          )}
          
          {/* Input */}
          <input
            type={type}
            className={inputClasses}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          
          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {/* Helper Text or Error */}
        {(error || helperText) && (
          <p className={cn(
            'mt-2 text-sm',
            error ? 'text-red-600' : 'text-slate-600'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Search Input Component
interface SearchInputProps extends Omit<InputProps, 'variant' | 'leftIcon'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, showClearButton = true, value, ...props }, ref) => {
    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    return (
      <Input
        ref={ref}
        variant="search"
        value={value}
        rightIcon={
          showClearButton && value ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ) : undefined
        }
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { Input, SearchInput };