import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { RequestInformation, RequestStatus, ApiResponse } from '../types';
import { getErrorMessage } from '../utils';

// Query keys
export const requestsKeys = {
  all: ['requests'] as const,
  lists: () => [...requestsKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...requestsKeys.lists(), filters] as const,
  details: () => [...requestsKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestsKeys.details(), id] as const,
  summary: () => [...requestsKeys.all, 'summary'] as const,
};

// Hook for fetching paginated requests
export function useRequests(params: {
  status?: RequestStatus;
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  return useQuery({
    queryKey: requestsKeys.list(params),
    queryFn: () => ApiService.getRequests(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching requests summary
export function useRequestsSummary(dateRange?: {
  startDate: string;
  endDate: string;
}) {
  return useQuery({
    queryKey: requestsKeys.summary(),
    queryFn: () => ApiService.getRequestsSummary(dateRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching single request
export function useRequest(requestId: string) {
  return useQuery({
    queryKey: requestsKeys.detail(requestId),
    queryFn: () => ApiService.getRequestById(requestId),
    enabled: !!requestId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for creating new request
export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: Omit<RequestInformation, 'id' | 'createdAt' | 'updatedAt'>) =>
      ApiService.createRequest(request),
    onSuccess: () => {
      // Invalidate and refetch requests list
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestsKeys.summary() });
    },
    onError: (error) => {
      console.error('Error creating request:', getErrorMessage(error));
    },
  });
}

// Hook for updating request status
export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: RequestStatus }) =>
      ApiService.updateRequestStatus(requestId, status),
    onMutate: async ({ requestId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: requestsKeys.lists() });

      // Snapshot the previous value
      const previousRequests = queryClient.getQueriesData({ queryKey: requestsKeys.lists() });

      // Optimistically update to the new value
      queryClient.setQueriesData<ApiResponse<RequestInformation>>(
        { queryKey: requestsKeys.lists() },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            data: old.data.map((request) =>
              request.id === requestId
                ? { ...request, status, updatedAt: new Date().toISOString() }
                : request
            ),
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousRequests };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousRequests) {
        context.previousRequests.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Error updating request status:', getErrorMessage(error));
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestsKeys.summary() });
    },
  });
}

// Hook for request notes
export function useRequestNotes(requestId: string) {
  return useQuery({
    queryKey: [...requestsKeys.detail(requestId), 'notes'],
    queryFn: () => ApiService.getRequestNotes(requestId),
    enabled: !!requestId,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook for adding request note
export function useAddRequestNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, content }: { requestId: string; content: string }) =>
      ApiService.addRequestNote(requestId, content),
    onSuccess: (data, variables) => {
      // Invalidate notes for this request
      queryClient.invalidateQueries({
        queryKey: [...requestsKeys.detail(variables.requestId), 'notes'],
      });
    },
    onError: (error) => {
      console.error('Error adding note:', getErrorMessage(error));
    },
  });
}

// Hook for updating request note
export function useUpdateRequestNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      ApiService.updateRequestNote(noteId, content),
    onSuccess: () => {
      // Invalidate all notes queries
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey.includes('notes'),
      });
    },
    onError: (error) => {
      console.error('Error updating note:', getErrorMessage(error));
    },
  });
}

// Hook for deleting request note
export function useDeleteRequestNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => ApiService.deleteRequestNote(noteId),
    onSuccess: () => {
      // Invalidate all notes queries
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey.includes('notes'),
      });
    },
    onError: (error) => {
      console.error('Error deleting note:', getErrorMessage(error));
    },
  });
}