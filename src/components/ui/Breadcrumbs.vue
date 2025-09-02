<template>
  <nav aria-label="breadcrumb" class="mb-4">
    <ol class="flex items-center space-x-2 text-sm text-slate-600">
      <li v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center">
        <router-link
          v-if="index < breadcrumbs.length - 1"
          :to="crumb.path"
          class="hover:text-accent-blue transition-colors"
        >
          {{ crumb.label }}
        </router-link>
        <span v-else class="text-charcoal font-medium">
          {{ crumb.label }}
        </span>
        <span v-if="index < breadcrumbs.length - 1" class="ml-2 text-slate-400">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface BreadcrumbItem {
  label: string
  path: string
}

defineProps<{
  breadcrumbs: BreadcrumbItem[]
}>()
</script>