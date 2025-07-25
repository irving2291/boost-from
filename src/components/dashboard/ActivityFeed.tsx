import React from 'react';
import { Clock, User, ArrowRight } from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../ui';
import { formatRelativeTime, cn } from '../../utils';
import { STATUS_LABELS } from '../../utils/constants';
import type { RequestInformation, RequestStatus } from '../../types';

interface ActivityItem {
  id: string;
  type: 'status_change' | 'note_added' | 'request_created';
  requestId: string;
  requestTitle: string;
  fromStatus?: RequestStatus;
  toStatus?: RequestStatus;
  user: string;
  timestamp: string;
  description?: string;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities = [], 
  loading = false,
  maxItems = 10 
}) => {
  // Mock data for demonstration
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'status_change',
      requestId: 'req-001',
      requestTitle: 'Juan Pérez - Consulta Web',
      fromStatus: 'NEW',
      toStatus: 'IN_PROGRESS',
      user: 'María García',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    },
    {
      id: '2',
      type: 'request_created',
      requestId: 'req-002',
      requestTitle: 'Ana López - Cotización Servicio',
      user: 'Sistema',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    },
    {
      id: '3',
      type: 'status_change',
      requestId: 'req-003',
      requestTitle: 'Carlos Ruiz - Seguimiento',
      fromStatus: 'IN_PROGRESS',
      toStatus: 'WON',
      user: 'Pedro Martínez',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: '4',
      type: 'note_added',
      requestId: 'req-001',
      requestTitle: 'Juan Pérez - Consulta Web',
      user: 'María García',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      description: 'Cliente interesado en el paquete premium',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;
  const limitedActivities = displayActivities.slice(0, maxItems);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'status_change':
        return <ArrowRight size={16} className="text-blue-500" />;
      case 'note_added':
        return <User size={16} className="text-green-500" />;
      case 'request_created':
        return <Clock size={16} className="text-slate-500" />;
      default:
        return <Clock size={16} className="text-slate-500" />;
    }
  };

  const getActivityDescription = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'status_change':
        return (
          <div className="flex items-center space-x-2">
            <span>cambió de</span>
            <Badge status={activity.fromStatus} size="sm">
              {STATUS_LABELS[activity.fromStatus!]}
            </Badge>
            <span>a</span>
            <Badge status={activity.toStatus} size="sm">
              {STATUS_LABELS[activity.toStatus!]}
            </Badge>
          </div>
        );
      case 'note_added':
        return (
          <div>
            <span>agregó una nota</span>
            {activity.description && (
              <p className="text-sm text-slate-600 mt-1 italic">
                "{activity.description}"
              </p>
            )}
          </div>
        );
      case 'request_created':
        return <span>creó un nuevo request</span>;
      default:
        return <span>realizó una acción</span>;
    }
  };

  if (loading) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {limitedActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {limitedActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start space-x-3 pb-4',
                  index < limitedActivities.length - 1 && 'border-b border-slate-100'
                )}
              >
                {/* Activity Icon */}
                <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">
                        <span className="font-medium">{activity.user}</span>
                        {' '}
                        {getActivityDescription(activity)}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {activity.requestTitle}
                      </p>
                    </div>
                    <time className="text-xs text-slate-500 flex-shrink-0 ml-2">
                      {formatRelativeTime(activity.timestamp)}
                    </time>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { ActivityFeed };
export type { ActivityItem };