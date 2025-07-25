import React from 'react';
import { User, Calendar, Phone, EnvelopeSimple, NotePencil } from '@phosphor-icons/react';
import { Card, CardContent, Badge } from '../ui';
import { formatDate, getInitials, cn } from '../../utils';
import { STATUS_LABELS } from '../../utils/constants';
import type { RequestInformation } from '../../types';

interface RequestCardProps {
  request: RequestInformation;
  isDragging?: boolean;
  onEdit?: (request: RequestInformation) => void;
  onAddNote?: (requestId: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
  request,
  isDragging = false,
  onEdit,
  onAddNote,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onEdit) {
      onEdit(request);
    }
  };

  const handleAddNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddNote) {
      onAddNote(request.id);
    }
  };

  return (
    <Card
      variant="elevated"
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-elegant-lg',
        'border-l-4 border-l-slate-300',
        isDragging && 'opacity-50 rotate-2 scale-105 z-50'
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Header with Status Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {request.firstName} {request.lastName}
            </h3>
            {request.company && (
              <p className="text-xs text-slate-600 truncate mt-1">
                {request.company}
              </p>
            )}
          </div>
          <Badge status={request.status} size="sm">
            {STATUS_LABELS[request.status]}
          </Badge>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-xs text-slate-600">
            <EnvelopeSimple size={12} className="mr-2 flex-shrink-0" />
            <span className="truncate">{request.email}</span>
          </div>
          
          {request.phone && (
            <div className="flex items-center text-xs text-slate-600">
              <Phone size={12} className="mr-2 flex-shrink-0" />
              <span className="truncate">{request.phone}</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <div className="flex items-center">
            <Calendar size={12} className="mr-1" />
            <span>Creado: {formatDate(request.createdAt, 'dd/MM')}</span>
          </div>
          {request.updatedAt !== request.createdAt && (
            <div className="flex items-center">
              <span>Act: {formatDate(request.updatedAt, 'dd/MM')}</span>
            </div>
          )}
        </div>

        {/* Notes indicator and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {request.notes && request.notes.length > 0 && (
              <div className="flex items-center text-xs text-slate-500">
                <NotePencil size={12} className="mr-1" />
                <span>{request.notes.length} nota{request.notes.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {getInitials(request.firstName, request.lastName)}
          </div>
        </div>

        {/* Action buttons (visible on hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-3 pt-3 border-t border-slate-100">
          <button
            onClick={handleAddNote}
            className="text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            + Agregar nota
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export { RequestCard };