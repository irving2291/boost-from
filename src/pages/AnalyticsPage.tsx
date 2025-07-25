import React from 'react';
import { ChartLine, TrendUp, Users, Target } from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analíticas</h1>
        <p className="text-slate-600 mt-1">
          Visualiza métricas y tendencias de tu negocio.
        </p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Conversión Mensual</h3>
              <TrendUp size={20} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">24.5%</p>
            <p className="text-xs text-green-600 mt-1">+2.1% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Clientes Activos</h3>
              <Users size={20} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">1,247</p>
            <p className="text-xs text-blue-600 mt-1">+15 nuevos esta semana</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Revenue</h3>
              <Target size={20} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">$45,230</p>
            <p className="text-xs text-green-600 mt-1">+8.2% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Tiempo Promedio</h3>
              <ChartLine size={20} className="text-slate-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">12.4 días</p>
            <p className="text-xs text-slate-600 mt-1">Para cerrar requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Tendencias de Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
              <p className="text-slate-500">Gráfico de tendencias en desarrollo...</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Distribución por Fuente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
              <p className="text-slate-500">Gráfico de distribución en desarrollo...</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Métricas de Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">85%</p>
              <p className="text-sm text-slate-600 mt-1">Satisfacción del Cliente</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">92%</p>
              <p className="text-sm text-slate-600 mt-1">Tasa de Retención</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">4.2</p>
              <p className="text-sm text-slate-600 mt-1">Rating Promedio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { AnalyticsPage };