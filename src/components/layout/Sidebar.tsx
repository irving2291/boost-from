import React from 'react';
import { House, Kanban, ChartLine, Gear } from '@phosphor-icons/react';
import { Badge } from '../ui';
import { cn } from '../../utils';
import { useRequestsSummary } from '../../hooks/useRequests';
import { REQUEST_STATUSES, STATUS_LABELS } from '../../utils/constants';

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPath = '/dashboard', 
  onNavigate,
  className 
}) => {
  // Safely use the hook with error handling
  let summary: any = null;
  let activeRequestsCount = 0;
  
  try {
    const summaryQuery = useRequestsSummary();
    summary = summaryQuery.data;
    activeRequestsCount = summary ?
      REQUEST_STATUSES.reduce((total, status) => total + (summary.byStatus[status] || 0), 0) : 0;
  } catch (error) {
    console.warn('Error fetching requests summary in Sidebar:', error);
    summary = null;
    activeRequestsCount = 0;
  }

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <House size={20} />,
      path: '/dashboard',
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: <Kanban size={20} />,
      path: '/requests',
      badge: activeRequestsCount,
    },
    {
      id: 'analytics',
      label: 'Analíticas',
      icon: <ChartLine size={20} />,
      path: '/analytics',
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <Gear size={20} />,
      path: '/settings',
    },
  ];

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <aside className={cn(
      'text-white w-64 min-h-screen flex flex-col',
      'border-r border-slate-500 shadow-inner',
      className
    )} style={{background: 'linear-gradient(to bottom, #4A5568, #2D3748)'}}>
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-300 border-opacity-30">
        <h1 className="text-xl font-bold text-white">
          CRM System
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Gestión de Clientes
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.path;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200',
                    'hover:bg-slate-600 hover:bg-opacity-40 focus:outline-none focus:ring-2 focus:ring-slate-400',
                    isActive && 'text-white',
                    !isActive && 'text-slate-200 hover:text-white'
                  )}
                  style={isActive ? {background: 'linear-gradient(to right, #5A6578, #4A5568)'} : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <span className={cn(
                      'transition-colors duration-200',
                      isActive ? 'text-white' : 'text-slate-200'
                    )}>
                      {item.icon}
                    </span>
                    <span className="font-medium">
                      {item.label}
                    </span>
                  </div>
                  
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="bg-slate-600 bg-opacity-70 text-white border-slate-500"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status Summary */}
      {summary && (
        <div className="p-4 border-t border-slate-300 border-opacity-30">
          <h3 className="text-sm font-medium text-slate-100 mb-3">
            Estado de Requests
          </h3>
          <div className="space-y-2">
            {REQUEST_STATUSES.map((status) => {
              const count = summary.byStatus[status] || 0;
              if (count === 0) return null;
              
              return (
                <div key={status} className="flex items-center justify-between text-xs">
                  <span className="text-slate-200">
                    {STATUS_LABELS[status]}
                  </span>
                  <span className="text-white font-medium">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Conversion Rate */}
          {summary.conversionRate > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-300 border-opacity-30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200">
                  Tasa de Conversión
                </span>
                <span className="text-green-300 font-medium">
                  {(summary.conversionRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-slate-300 border-opacity-30">
        <p className="text-xs text-slate-200 text-center">
          © 2024 CRM System
        </p>
      </div>
    </aside>
  );
};

export { Sidebar };