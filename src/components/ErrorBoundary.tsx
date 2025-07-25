import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { XCircle, ArrowClockwise } from '@phosphor-icons/react';
import { Button } from './ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-elegant border border-slate-200 p-6 text-center">
            <div className="mb-4">
              <XCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900 mb-2">
                ¡Oops! Algo salió mal
              </h1>
              <p className="text-slate-600 text-sm">
                Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
              </p>
            </div>

            {/* Error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Error Details:
                </h3>
                <pre className="text-xs text-red-700 overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={this.handleReset}
                variant="primary"
                className="w-full"
              >
                <ArrowClockwise size={16} className="mr-2" />
                Intentar de nuevo
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Recargar página
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Si el problema persiste, contacta al soporte técnico.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    // You could send this to an error reporting service
  };
};

export { ErrorBoundary };