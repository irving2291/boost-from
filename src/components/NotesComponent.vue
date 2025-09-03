<template>
  <div class="notes-section">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-charcoal">Notas</h3>
      <button
        @click="showCreateForm = !showCreateForm"
        class="bg-accent-blue hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
      >
        <PhPlus :size="16" />
        <span>Agregar Nota</span>
      </button>
    </div>

    <!-- Create Note Form -->
    <div v-if="showCreateForm" class="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
      <form @submit.prevent="handleCreateNote">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-2">Contenido de la nota</label>
            <textarea
              v-model="newNoteContent"
              required
              rows="4"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Escribe tu nota aquí..."
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="cancelCreateNote"
              class="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="px-4 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {{ creating ? 'Creando...' : 'Crear Nota' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-slate-500">Cargando notas...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500">{{ error }}</p>
      <button
        @click="fetchNotes"
        class="mt-2 px-4 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600"
      >
        Reintentar
      </button>
    </div>

    <!-- Notes List -->
    <div v-else-if="notes.length > 0" class="space-y-3">
      <div
        v-for="note in notes"
        :key="note.id"
        class="bg-gray-50 rounded-lg border border-gray-200 p-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-slate-800 whitespace-pre-wrap">{{ note.content }}</p>
            <div class="flex items-center space-x-4 mt-3 text-xs text-slate-500">
              <span v-if="note.author">{{ note.author.username }}</span>
              <span>{{ formatDate(note.createdAt) }}</span>
              <span v-if="note.updatedAt && note.updatedAt !== note.createdAt">
                Editado: {{ formatDate(note.updatedAt) }}
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button
              @click="startEditNote(note)"
              class="text-blue-600 hover:text-blue-800 p-1"
              title="Editar nota"
            >
              <PhPencil :size="16" />
            </button>
            <button
              @click="deleteNote(note.id)"
              class="text-red-600 hover:text-red-800 p-1"
              title="Eliminar nota"
            >
              <PhTrash :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 text-slate-500">
      <PhFileText :size="48" class="mx-auto mb-3 opacity-50" />
      <p>No hay notas para esta solicitud</p>
    </div>

    <!-- Edit Note Modal -->
    <div v-if="editingNote" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-charcoal mb-4">Editar Nota</h3>
        <form @submit.prevent="handleUpdateNote">
          <div class="mb-4">
            <textarea
              v-model="editNoteContent"
              required
              rows="6"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Contenido de la nota..."
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="cancelEditNote"
              class="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="updating"
              class="px-4 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {{ updating ? 'Actualizando...' : 'Actualizar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PhPlus, PhPencil, PhTrash, PhFileText } from '@phosphor-icons/vue'
import { notesService, type Note } from '../services/notesService'

interface Props {
  requestId: string
}

const props = defineProps<Props>()

const notes = ref<Note[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showCreateForm = ref(false)
const newNoteContent = ref('')
const creating = ref(false)
const editingNote = ref<Note | null>(null)
const editNoteContent = ref('')
const updating = ref(false)

const fetchNotes = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await notesService.getNotes(props.requestId)
    notes.value = response
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar notas'
    console.error('Error fetching notes:', err)
  } finally {
    loading.value = false
  }
}

const handleCreateNote = async () => {
  if (!newNoteContent.value.trim()) return

  try {
    creating.value = true
    const newNote = await notesService.createNote({
      content: newNoteContent.value.trim(),
      requestId: props.requestId
    })
    notes.value.unshift(newNote) // Add to beginning of list
    newNoteContent.value = ''
    showCreateForm.value = false
  } catch (err) {
    console.error('Error creating note:', err)
    alert('Error al crear la nota')
  } finally {
    creating.value = false
  }
}

const cancelCreateNote = () => {
  newNoteContent.value = ''
  showCreateForm.value = false
}

const startEditNote = (note: Note) => {
  editingNote.value = note
  editNoteContent.value = note.content
}

const handleUpdateNote = async () => {
  if (!editingNote.value || !editNoteContent.value.trim()) return

  try {
    updating.value = true
    const updatedNote = await notesService.updateNote(editingNote.value.id, {
      content: editNoteContent.value.trim()
    })
    const index = notes.value.findIndex((n: Note) => n.id === updatedNote.id)
    if (index !== -1) {
      notes.value[index] = updatedNote
    }
    editingNote.value = null
    editNoteContent.value = ''
  } catch (err) {
    console.error('Error updating note:', err)
    alert('Error al actualizar la nota')
  } finally {
    updating.value = false
  }
}

const cancelEditNote = () => {
  editingNote.value = null
  editNoteContent.value = ''
}

const deleteNote = async (noteId: string) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return

  try {
    await notesService.deleteNote(noteId)
    notes.value = notes.value.filter((n: Note) => n.id !== noteId)
  } catch (err) {
    console.error('Error deleting note:', err)
    alert('Error al eliminar la nota')
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchNotes()
})
</script>

<style scoped>
/* Custom scrollbar if needed */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>