import React from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  TrendUp,
  ChartLine,
  Target
} from '@phosphor-icons/react';
import { KPICard } from './KPICard';
import { StatusChart } from './StatusChart';
import { ActivityFeed } from './ActivityFeed';
import { formatPercentage } from '../../utils';

const Dashboard: React.FC = () => {
  // Use static mock data to avoid hook issues
  const mockSummary = {
    byStatus: {
      NEW: 12,
      IN_PROGRESS: 8,
      RECONTACT: 3,
      WON: 15,
      LOST: 5,
      CLOSE: 0,
    },
    total: 43,
    conversionRate: 0.28,
    avgTimeToClose: 14,
  };

  // Calculate metrics from mock data
  const totalRequests = 43;
  const inProgressCount = 8;
  const wonCount = 15;
  const conversionRate = 0.28;

  // Mock previous values for trend calculation
  const previousTotalRequests = 45;
  const previousInProgress = 8;
  const previousWon = 12;
  const previousConversionRate = 0.22;

  // Calculate trends
  const totalTrend = totalRequests > previousTotalRequests ? 'up' : 
                    totalRequests < previousTotalRequests ? 'down' : 'neutral';
  const totalTrendValue = totalRequests > 0 ? 
    ((totalRequests - previousTotalRequests) / previousTotalRequests) * 100 : 0;

  const inProgressTrend = inProgressCount > previousInProgress ? 'up' : 
                         inProgressCount < previousInProgress ? 'down' : 'neutral';
  const inProgressTrendValue = previousInProgress > 0 ? 
    ((inProgressCount - previousInProgress) / previousInProgress) * 100 : 0;

  const wonTrend = wonCount > previousWon ? 'up' : 
                  wonCount < previousWon ? 'down' : 'neutral';
  const wonTrendValue = previousWon > 0 ? 
    ((wonCount - previousWon) / previousWon) * 100 : 0;

  const conversionTrend = conversionRate > previousConversionRate ? 'up' : 
                         conversionRate < previousConversionRate ? 'down' : 'neutral';
  const conversionTrendValue = previousConversionRate > 0 ? 
    ((conversionRate - previousConversionRate) / previousConversionRate) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Bienvenido al sistema CRM. Aquí tienes un resumen de tu actividad.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Requests"
          value={totalRequests}
          previousValue={previousTotalRequests}
          trend={totalTrend}
          trendValue={totalTrendValue}
          icon={<Users size={24} />}
          color="default"
          loading={false}
        />
        
        <KPICard
          title="En Proceso"
          value={inProgressCount}
          previousValue={previousInProgress}
          trend={inProgressTrend}
          trendValue={inProgressTrendValue}
          icon={<Clock size={24} />}
          color="blue"
          loading={false}
        />
        
        <KPICard
          title="Ganados"
          value={wonCount}
          previousValue={previousWon}
          trend={wonTrend}
          trendValue={wonTrendValue}
          icon={<CheckCircle size={24} />}
          color="green"
          loading={false}
        />
        
        <KPICard
          title="Conversión"
          value={formatPercentage(conversionRate)}
          previousValue={formatPercentage(previousConversionRate)}
          trend={conversionTrend}
          trendValue={conversionTrendValue}
          icon={<Target size={24} />}
          color="default"
          loading={false}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <StatusChart data={mockSummary} loading={false} />
        
        {/* Activity Feed */}
        <ActivityFeed loading={false} />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">Tiempo Promedio</h3>
            <ChartLine size={20} className="text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            14 días
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Para cerrar requests
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">Nuevos Hoy</h3>
            <TrendUp size={20} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            12
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Requests nuevos
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">Pendientes</h3>
            <Clock size={20} className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            3
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Requieren seguimiento
          </p>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };