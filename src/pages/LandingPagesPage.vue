<template>
  <Layout>
    <div class="h-full flex flex-col space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ t('navigation.landingPages') }}</h1>
          <p class="text-gray-600">{{ t('landingPages.description') }}</p>
        </div>
        <div class="flex items-center space-x-4">
          <!-- View Toggle -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              {{ t('common.grid') }}
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              {{ t('common.list') }}
            </button>
          </div>
          
          <!-- Create Button -->
          <div class="flex items-center space-x-2">
            <button
              @click="createWithBuilder"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              {{ t('landingPages.createWithBuilder') }}
            </button>
            <button
              @click="showCreateModal = true"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              {{ t('landingPages.createSimple') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm text-gray-600">{{ t('common.status') }}:</label>
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{{ t('common.all') }}</option>
            <option value="published">{{ t('landingPages.published') }}</option>
            <option value="draft">{{ t('landingPages.draft') }}</option>
          </select>
        </div>
        
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('landingPages.searchPlaceholder')"
            class="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-h-0">
        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="page in filteredPages"
            :key="page.id"
            class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ page.title }}</h3>
                  <p class="text-sm text-gray-500 mb-2">/{{ page.slug }}</p>
                  <div class="flex items-center space-x-2">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        page.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ page.isPublished ? t('landingPages.published') : t('landingPages.draft') }}
                    </span>
                    <span
                      v-if="page.hasContactForm"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                    >
                      {{ t('landingPages.hasForm') }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="editWithBuilder(page)"
                    class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    :title="t('landingPages.editWithBuilder')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    @click="editPage(page)"
                    class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    :title="t('landingPages.editSimple')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                  <button
                    @click="deletePage(page)"
                    class="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    :title="t('common.delete')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="text-xs text-gray-500">
                  {{ t('common.updated') }}: {{ formatDate(page.updatedAt) }}
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    v-if="page.isPublished"
                    @click="viewPage(page)"
                    class="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {{ t('landingPages.view') }}
                  </button>
                  <button
                    @click="togglePublish(page)"
                    :class="[
                      'text-xs font-medium',
                      page.isPublished
                        ? 'text-gray-600 hover:text-gray-800'
                        : 'text-green-600 hover:text-green-800'
                    ]"
                  >
                    {{ page.isPublished ? t('landingPages.unpublish') : t('landingPages.publish') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div v-else class="bg-white rounded-lg shadow-sm border">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('landingPages.title') }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('landingPages.slug') }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('common.status') }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('landingPages.form') }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('common.updated') }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('common.actions') }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="page in filteredPages" :key="page.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ page.title }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">/{{ page.slug }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        page.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ page.isPublished ? t('landingPages.published') : t('landingPages.draft') }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      v-if="page.hasContactForm"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                    >
                      {{ t('common.yes') }}
                    </span>
                    <span v-else class="text-sm text-gray-500">{{ t('common.no') }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(page.updatedAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      v-if="page.isPublished"
                      @click="viewPage(page)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      {{ t('landingPages.view') }}
                    </button>
                    <button
                      @click="editPage(page)"
                      class="text-gray-600 hover:text-gray-900"
                    >
                      {{ t('common.edit') }}
                    </button>
                    <button
                      @click="togglePublish(page)"
                      :class="[
                        page.isPublished
                          ? 'text-gray-600 hover:text-gray-900'
                          : 'text-green-600 hover:text-green-900'
                      ]"
                    >
                      {{ page.isPublished ? t('landingPages.unpublish') : t('landingPages.publish') }}
                    </button>
                    <button
                      @click="deletePage(page)"
                      class="text-red-600 hover:text-red-900"
                    >
                      {{ t('common.delete') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredPages.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">{{ t('landingPages.noPages') }}</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ searchQuery || statusFilter ? t('landingPages.noPagesFiltered') : t('landingPages.noPagesYet') }}
          </p>
          <div v-if="!searchQuery && !statusFilter" class="mt-6">
            <button
              @click="showCreateModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              {{ t('landingPages.createFirst') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Modal
      v-if="showCreateModal || showEditModal"
      :title="showCreateModal ? t('landingPages.createNew') : t('landingPages.editPage')"
      @close="closeModal"
    >
      <LandingPageForm
        :page="editingPage"
        @save="handleSave"
        @cancel="closeModal"
      />
    </Modal>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Layout from '../components/layout/Layout.vue'
import Modal from '../core/components/Modal.vue'
import LandingPageForm from '../components/landing-pages/LandingPageForm.vue'
import { useLandingPagesStore } from '../stores/landing-pages'
import type { LandingPage } from '../types/landing-pages'

const { t } = useI18n()
const router = useRouter()
const landingPagesStore = useLandingPagesStore()

// Reactive data
const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')
const statusFilter = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingPage = ref<LandingPage | null>(null)

// Computed properties
const filteredPages = computed(() => {
  let filtered = landingPagesStore.landingPages

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(page =>
      page.title.toLowerCase().includes(query) ||
      page.slug.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (statusFilter.value) {
    if (statusFilter.value === 'published') {
      filtered = filtered.filter(page => page.isPublished)
    } else if (statusFilter.value === 'draft') {
      filtered = filtered.filter(page => !page.isPublished)
    }
  }

  return filtered
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const editPage = (page: LandingPage) => {
  editingPage.value = page
  showEditModal.value = true
}

const createWithBuilder = () => {
  router.push('/landing-pages/builder')
}

const editWithBuilder = (page: LandingPage) => {
  router.push(`/landing-pages/builder/${page.id}`)
}

const deletePage = async (page: LandingPage) => {
  if (confirm(t('landingPages.confirmDelete', { title: page.title }))) {
    try {
      await landingPagesStore.deleteLandingPage(page.id)
    } catch (error) {
      console.error('Error deleting page:', error)
    }
  }
}

const togglePublish = async (page: LandingPage) => {
  try {
    if (page.isPublished) {
      await landingPagesStore.unpublishLandingPage(page.id)
    } else {
      await landingPagesStore.publishLandingPage(page.id)
    }
  } catch (error) {
    console.error('Error toggling publish status:', error)
  }
}

const viewPage = (page: LandingPage) => {
  // Open in new tab
  window.open(`/landing/${page.slug}`, '_blank')
}

const handleSave = async (pageData: any) => {
  try {
    if (showCreateModal.value) {
      await landingPagesStore.createLandingPage(pageData)
    } else if (editingPage.value) {
      await landingPagesStore.updateLandingPage(editingPage.value.id, pageData)
    }
    closeModal()
  } catch (error) {
    console.error('Error saving page:', error)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingPage.value = null
}

// Lifecycle
onMounted(async () => {
  await landingPagesStore.fetchLandingPages()
})
</script>