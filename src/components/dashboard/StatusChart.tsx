import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { STATUS_LABELS, REQUEST_STATUSES } from '../../utils/constants';
import type { RequestSummary } from '../../types';

interface StatusChartProps {
  data?: RequestSummary;
  loading?: boolean;
}

const StatusChart: React.FC<StatusChartProps> = ({ data, loading = false }) => {
  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!data) return [];
    
    return REQUEST_STATUSES.map(status => ({
      name: STATUS_LABELS[status],
      value: data.byStatus[status] || 0,
      status,
    })).filter(item => item.value > 0);
  }, [data]);

  // Colors for each status
  const COLORS = {
    NEW: '#94a3b8',      // slate-400
    IN_PROGRESS: '#3b82f6', // blue-500
    RECONTACT: '#f59e0b',   // yellow-500
    WON: '#10b981',         // green-500
    LOST: '#ef4444',        // red-500
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-elegant">
          <p className="text-sm font-medium text-slate-900">
            {data.payload.name}
          </p>
          <p className="text-sm text-slate-600">
            Cantidad: <span className="font-medium">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Distribución por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse">
              <div className="w-32 h-32 bg-slate-200 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || chartData.length === 0) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Distribución por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-slate-500">No hay datos disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Distribución por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.status as keyof typeof COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span className="text-sm text-slate-700">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export { StatusChart };