import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from '@phosphor-icons/react';
import { RequestCard } from './RequestCard';
import { Button, Badge } from '../ui';
import { cn } from '../../utils';
import { STATUS_LABELS } from '../../utils/constants';
import type { RequestInformation, RequestStatus } from '../../types';

interface KanbanColumnProps {
  status: RequestStatus;
  requests: RequestInformation[];
  onAddRequest?: (status: RequestStatus) => void;
  onEditRequest?: (request: RequestInformation) => void;
  onAddNote?: (requestId: string) => void;
  isMobile?: boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  requests,
  onAddRequest,
  onEditRequest,
  onAddNote,
  isMobile = false,
}) => {
  const {
    isOver,
    setNodeRef,
  } = useDroppable({
    id: status,
  });

  const handleAddRequest = () => {
    if (onAddRequest) {
      onAddRequest(status);
    }
  };

  // Simplified neutral styling - no colors, just fine borders
  const getColumnColor = () => {
    return 'border-slate-300 bg-white';
  };

  const getHeaderColor = () => {
    return 'text-slate-700 bg-slate-50';
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border transition-all duration-200',
        isMobile ? 'min-h-[300px]' : 'h-full min-h-[600px]',
        getColumnColor(),
        isOver && 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-100'
      )}
    >
      {/* Column Header */}
      <div className={cn(
        'flex items-center justify-between p-4 rounded-t-lg border-b border-slate-200',
        getHeaderColor()
      )}>
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-sm">
            {STATUS_LABELS[status]}
          </h3>
          <Badge variant="secondary" size="sm">
            {requests.length}
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddRequest}
          className="p-1 hover:bg-white hover:bg-opacity-50"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto"
      >
        <SortableContext
          items={requests.map(r => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-slate-400 mb-2">
                  <Plus size={32} className="mx-auto opacity-50" />
                </div>
                <p className="text-sm text-slate-500">
                  No hay requests en {STATUS_LABELS[status].toLowerCase()}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddRequest}
                  className="mt-2 text-xs"
                >
                  Agregar request
                </Button>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="group">
                  <RequestCard
                    request={request}
                    onEdit={onEditRequest}
                    onAddNote={onAddNote}
                  />
                </div>
              ))
            )}
          </div>
        </SortableContext>
      </div>

      {/* Column Footer */}
      <div className="p-3 border-t border-current border-opacity-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddRequest}
          className="w-full text-xs hover:bg-white hover:bg-opacity-50"
        >
          <Plus size={14} className="mr-1" />
          Agregar request
        </Button>
      </div>
    </div>
  );
};

export { KanbanColumn };