import React from 'react';
import { KanbanBoard } from '../components/kanban';
import type { RequestInformation, RequestStatus } from '../types';

interface RequestsPageProps {
  searchQuery?: string;
}

const RequestsPage: React.FC<RequestsPageProps> = ({ searchQuery }) => {
  const handleEditRequest = (request: RequestInformation) => {
    // TODO: Implement edit request modal/form
    console.log('Edit request:', request);
  };

  const handleAddRequest = (status: RequestStatus) => {
    // TODO: Implement add request modal/form
    console.log('Add request with status:', status);
  };

  const handleAddNote = (requestId: string) => {
    // TODO: Implement add note modal/form
    console.log('Add note to request:', requestId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestión de Requests</h1>
        <p className="text-slate-600 mt-1">
          Administra tus solicitudes de clientes en formato Kanban.
        </p>
      </div>
      
      {/* Search Query Indicator */}
      {searchQuery && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Buscando: <strong>{searchQuery}</strong>
          </p>
        </div>
      )}
      
      {/* Kanban Board */}
      <KanbanBoard
        searchQuery={searchQuery}
        onEditRequest={handleEditRequest}
        onAddRequest={handleAddRequest}
        onAddNote={handleAddNote}
      />
    </div>
  );
};

export { RequestsPage };