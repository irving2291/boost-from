<template>
  <div class="tabs-container">
    <!-- Tab Headers -->
    <div class="border-b border-gray-200">
      <nav class="flex space-x-2 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0',
            activeTab === tab.key
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          ]"
          :aria-current="activeTab === tab.key ? 'page' : undefined"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="mt-6">
      <slot :name="activeTab" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  defaultTab: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['tabChange'])

const activeTab = ref(props.defaultTab || (props.tabs[0] && props.tabs[0].key) || '')

const handleTabChange = (tabKey) => {
  activeTab.value = tabKey
  emit('tabChange', tabKey)
}

// Expose active tab for parent component
defineExpose({
  activeTab
})
</script>

<style scoped>
.tabs-container {
  width: 100%;
}
</style>