import axios from 'axios'
import { API_ENDPOINTS, createAuthHeaders } from '../utils/api'
import { useAuthStore } from '../stores/auth'

export interface Note {
  id: string
  content: string
  requestId: string
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    username: string
  }
}

export interface CreateNoteRequest {
  content: string
  requestId: string
}

export interface UpdateNoteRequest {
  content: string
}

export class NotesService {
  private getAuthHeaders() {
    const authStore = useAuthStore()
    return createAuthHeaders(authStore.token, authStore.currentOrganization?.id)
  }

  async getNotes(requestId: string): Promise<Note[]> {
    const url = `${API_ENDPOINTS.CRM.REQUESTS}/${requestId}/notes`

    const response = await axios.get(url, {
      headers: this.getAuthHeaders()
    })
    return response.data
  }

  async createNote(noteData: CreateNoteRequest): Promise<Note> {
    const response = await axios.post(`${API_ENDPOINTS.CRM.REQUESTS}/${noteData.requestId}/notes`, noteData, {
      headers: this.getAuthHeaders()
    })
    return response.data
  }

  async updateNote(noteId: string, noteData: UpdateNoteRequest): Promise<Note> {
    const response = await axios.put(`${API_ENDPOINTS.CRM.REQUESTS}/notes/${noteId}`, noteData, {
      headers: this.getAuthHeaders()
    })
    return response.data
  }

  async deleteNote(noteId: string): Promise<void> {
    await axios.delete(`${API_ENDPOINTS.CRM.REQUESTS}/notes/${noteId}`, {
      headers: this.getAuthHeaders()
    })
  }
}

// Export singleton instance
export const notesService = new NotesService()