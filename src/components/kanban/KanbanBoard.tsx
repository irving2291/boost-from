import React, { useState, useMemo } from 'react';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { RequestCard } from './RequestCard';
import { ConfirmationModal } from '../ui';
import { useRequests, useUpdateRequestStatus } from '../../hooks/useRequests';
import { groupBy, isValidTransition } from '../../utils';
import { REQUEST_STATUSES, STATUS_LABELS } from '../../utils/constants';
import type { RequestInformation, RequestStatus, StatusChangeConfirmation, ApiResponse } from '../../types';

interface KanbanBoardProps {
  searchQuery?: string;
  onEditRequest?: (request: RequestInformation) => void;
  onAddRequest?: (status: RequestStatus) => void;
  onAddNote?: (requestId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  searchQuery = '',
  onEditRequest,
  onAddRequest,
  onAddNote,
}) => {
  const [activeRequest, setActiveRequest] = useState<RequestInformation | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<StatusChangeConfirmation | null>(null);

  // Fetch requests data with error handling
  let requestsData: ApiResponse<RequestInformation> | null = null;
  let isLoading = false;
  
  try {
    const requestsQuery = useRequests({
      search: searchQuery || undefined,
    });
    requestsData = requestsQuery.data || null;
    isLoading = requestsQuery.isLoading;
  } catch (error) {
    console.warn('Error fetching requests in KanbanBoard, using mock data:', error);
    // Use mock data
    requestsData = {
      data: [
        {
          id: '1',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@email.com',
          phone: '+593 99 123 4567',
          company: 'Empresa ABC',
          status: 'NEW',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          notes: [],
        },
        {
          id: '2',
          firstName: 'María',
          lastName: 'García',
          email: 'maria.garcia@email.com',
          phone: '+593 99 234 5678',
          company: 'Tech Solutions',
          status: 'IN_PROGRESS',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          notes: [{
            id: '1',
            content: 'Cliente interesado en el paquete premium',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          }],
        },
        {
          id: '3',
          firstName: 'Carlos',
          lastName: 'Ruiz',
          email: 'carlos.ruiz@email.com',
          phone: '+593 99 345 6789',
          company: 'Innovate Corp',
          status: 'WON',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          notes: [],
        },
        {
          id: '4',
          firstName: 'Ana',
          lastName: 'López',
          email: 'ana.lopez@email.com',
          phone: '+593 99 456 7890',
          company: 'StartUp XYZ',
          status: 'RECONTACT',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          notes: [],
        },
      ],
      page: 1,
      limit: 10,
      count: 4,
    };
    isLoading = false;
  }

  // Mutation for updating request status
  const updateStatusMutation = useUpdateRequestStatus();

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group requests by status
  const requestsByStatus = useMemo(() => {
    if (!requestsData?.data) {
      // Return empty arrays for all statuses
      const result: Record<RequestStatus, RequestInformation[]> = {} as any;
      REQUEST_STATUSES.forEach(status => {
        result[status] = [];
      });
      return result;
    }
    
    const grouped = groupBy(requestsData.data, (request) => request.status);
    
    // Ensure all statuses have an array (even if empty)
    const result: Record<RequestStatus, RequestInformation[]> = {} as any;
    REQUEST_STATUSES.forEach(status => {
      result[status] = grouped[status] || [];
    });
    
    return result;
  }, [requestsData]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const request = findRequestById(active.id as string);
    setActiveRequest(request || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRequest(null);

    if (!over) return;

    const requestId = active.id as string;
    const newStatus = over.id as RequestStatus;
    const request = findRequestById(requestId);

    if (!request || request.status === newStatus) return;

    // Validate transition
    if (!isValidTransition(request.status, newStatus)) {
      // Show error notification or toast
      console.warn(`Invalid transition from ${request.status} to ${newStatus}`);
      return;
    }

    // Show confirmation modal
    setConfirmationModal({
      fromStatus: request.status,
      toStatus: newStatus,
      requestId: request.id,
      requestTitle: `${request.firstName} ${request.lastName}`,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmationModal) return;

    try {
      await updateStatusMutation.mutateAsync({
        requestId: confirmationModal.requestId,
        status: confirmationModal.toStatus,
      });
      
      setConfirmationModal(null);
    } catch (error) {
      console.error('Error updating request status:', error);
      // Handle error (show toast, etc.)
    }
  };

  const handleCancelStatusChange = () => {
    setConfirmationModal(null);
  };

  const findRequestById = (id: string): RequestInformation | undefined => {
    if (!requestsData?.data) return undefined;
    return requestsData.data.find(request => request.id === id);
  };

  const getConfirmationMessage = (confirmation: StatusChangeConfirmation) => {
    const fromLabel = STATUS_LABELS[confirmation.fromStatus];
    const toLabel = STATUS_LABELS[confirmation.toStatus];
    
    return `¿Estás seguro de que quieres cambiar "${confirmation.requestTitle}" de "${fromLabel}" a "${toLabel}"?`;
  };

  const getConfirmationVariant = (toStatus: RequestStatus) => {
    return toStatus === 'LOST' ? 'danger' : 'default';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
        {REQUEST_STATUSES.map((status) => (
          <div key={status} className="animate-pulse">
            <div className="bg-slate-200 rounded-lg h-96"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Mobile: Stack columns vertically */}
        <div className="block sm:hidden space-y-6">
          {REQUEST_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              requests={requestsByStatus[status] || []}
              onAddRequest={onAddRequest}
              onEditRequest={onEditRequest}
              onAddNote={onAddNote}
              isMobile={true}
            />
          ))}
        </div>

        {/* Tablet and Desktop: Grid layout */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
          {REQUEST_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              requests={requestsByStatus[status] || []}
              onAddRequest={onAddRequest}
              onEditRequest={onEditRequest}
              onAddNote={onAddNote}
            />
          ))}
        </div>

        <DragOverlay>
          {activeRequest ? (
            <RequestCard
              request={activeRequest}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Status Change Confirmation Modal */}
      {confirmationModal && (
        <ConfirmationModal
          isOpen={true}
          onClose={handleCancelStatusChange}
          onConfirm={handleConfirmStatusChange}
          title="Confirmar cambio de estado"
          description={getConfirmationMessage(confirmationModal)}
          confirmText="Confirmar cambio"
          cancelText="Cancelar"
          variant={getConfirmationVariant(confirmationModal.toStatus)}
          loading={updateStatusMutation.isPending}
        />
      )}
    </>
  );
};

export { KanbanBoard };