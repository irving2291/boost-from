import React from 'react';
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react';
import { Card, CardContent } from '../ui';
import { cn, formatPercentage } from '../../utils';

interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  icon?: React.ReactNode;
  color?: 'default' | 'blue' | 'green' | 'red' | 'yellow';
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  previousValue,
  trend,
  trendValue,
  icon,
  color = 'default',
  loading = false,
}) => {
  const colorClasses = {
    default: 'text-slate-900',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  };

  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-slate-600 bg-slate-50',
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendUp size={14} />;
      case 'down':
        return <TrendDown size={14} />;
      default:
        return <Minus size={14} />;
    }
  };

  if (loading) {
    return (
      <Card variant="elevated" className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className="h-6 w-6 bg-slate-200 rounded"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-20"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="hover:shadow-elegant-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-600">{title}</h3>
          {icon && (
            <div className={cn('text-slate-400', colorClasses[color])}>
              {icon}
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className={cn('text-2xl font-bold', colorClasses[color])}>
              {value}
            </p>
            
            {trend && trendValue !== undefined && (
              <div className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2',
                trendColors[trend]
              )}>
                {getTrendIcon()}
                <span className="ml-1">
                  {formatPercentage(Math.abs(trendValue / 100), 1)}
                </span>
              </div>
            )}
          </div>
          
          {previousValue && (
            <div className="text-right">
              <p className="text-xs text-slate-500">Anterior</p>
              <p className="text-sm font-medium text-slate-700">
                {previousValue}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { KPICard };