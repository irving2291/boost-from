<template>
  <div class="relative">
    <Dropdown
      :items="languageItems"
      :selected="currentLanguageItem"
      @select="handleLanguageChange"
      class="min-w-[140px]"
    >
      <template #trigger="{ isOpen }">
        <button
          class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          :class="{ 'ring-2 ring-indigo-500': isOpen }"
        >
          <span class="text-lg">{{ languageStore.getCurrentLanguageFlag() }}</span>
          <span>{{ languageStore.getCurrentLanguageName() }}</span>
          <svg
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': isOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </template>
      
      <template #item="{ item }">
        <div class="flex items-center space-x-3">
          <span class="text-lg">{{ item.flag }}</span>
          <span>{{ item.name }}</span>
        </div>
      </template>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '../../stores/language'
import Dropdown from '../../core/components/Dropdown.vue'
import type { MessageLanguages } from '../../locales'

const { t } = useI18n()
const languageStore = useLanguageStore()

const languageItems = computed(() => 
  languageStore.availableLanguages.map(lang => ({
    id: lang.code,
    label: lang.name,
    name: lang.name,
    flag: lang.flag,
    value: lang.code
  }))
)

const currentLanguageItem = computed(() => {
  const current = languageStore.availableLanguages.find(
    lang => lang.code === languageStore.currentLanguage
  )
  return current ? {
    id: current.code,
    label: current.name,
    name: current.name,
    flag: current.flag,
    value: current.code
  } : languageItems.value[0]
})

const handleLanguageChange = (item: any) => {
  languageStore.setLanguage(item.value as MessageLanguages)
}
</script>