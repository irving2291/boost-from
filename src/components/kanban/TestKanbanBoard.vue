<template>
  <div class="h-full flex flex-col bg-slate-200">
    <!-- Header with title -->
    <div class="flex items-center justify-between mb-6 flex-shrink-0 bg-slate-200 p-4">
      <h1 class="text-2xl font-bold text-charcoal">Test Pipeline - Z-Index Fix</h1>
      <button class="bg-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
        Test Button
      </button>
    </div>

    <!-- Kanban columns with horizontal scroll -->
    <div class="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-slate-200">
      <div class="flex gap-6 pb-4 h-full px-4" style="min-width: max-content;">
        <!-- Test Column 1 -->
        <div class="flex-shrink-0 flex flex-col bg-gray-100 rounded-lg transition-all duration-200 min-h-[600px]" style="width: 320px;">
          <!-- Column Header - Sticky -->
          <div class="sticky top-0 z-20 flex items-center justify-between p-4 bg-slate-300">
            <div class="flex items-center space-x-3">
              <h3 class="font-bold text-lg text-charcoal uppercase tracking-wide">EN PROGRESO</h3>
              <div class="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm font-semibold">3</div>
            </div>
          </div>
          
          <!-- Column Content -->
          <div class="flex-1 p-4 overflow-y-auto">
            <div class="space-y-4">
              <div v-for="i in 10" :key="i" class="bg-white p-4 rounded-lg shadow-sm border">
                <h4 class="font-medium text-gray-900">Test Card {{ i }}</h4>
                <p class="text-sm text-gray-600 mt-2">This is a test card to demonstrate scrolling behavior.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Test Column 2 -->
        <div class="flex-shrink-0 flex flex-col bg-gray-100 rounded-lg transition-all duration-200 min-h-[600px]" style="width: 320px;">
          <!-- Column Header - Sticky -->
          <div class="sticky top-0 z-20 flex items-center justify-between p-4 bg-slate-300">
            <div class="flex items-center space-x-3">
              <h3 class="font-bold text-lg text-charcoal uppercase tracking-wide">RECONTACTAR</h3>
              <div class="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm font-semibold">2</div>
            </div>
          </div>
          
          <!-- Column Content -->
          <div class="flex-1 p-4 overflow-y-auto">
            <div class="space-y-4">
              <div v-for="i in 8" :key="i" class="bg-white p-4 rounded-lg shadow-sm border">
                <h4 class="font-medium text-gray-900">Test Card {{ i }}</h4>
                <p class="text-sm text-gray-600 mt-2">This is a test card to demonstrate scrolling behavior.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Test Column 3 -->
        <div class="flex-shrink-0 flex flex-col bg-gray-100 rounded-lg transition-all duration-200 min-h-[600px]" style="width: 320px;">
          <!-- Column Header - Sticky -->
          <div class="sticky top-0 z-20 flex items-center justify-between p-4 bg-slate-300">
            <div class="flex items-center space-x-3">
              <h3 class="font-bold text-lg text-charcoal uppercase tracking-wide">GANADO</h3>
              <div class="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm font-semibold">5</div>
            </div>
          </div>
          
          <!-- Column Content -->
          <div class="flex-1 p-4 overflow-y-auto">
            <div class="space-y-4">
              <div v-for="i in 12" :key="i" class="bg-white p-4 rounded-lg shadow-sm border">
                <h4 class="font-medium text-gray-900">Test Card {{ i }}</h4>
                <p class="text-sm text-gray-600 mt-2">This is a test card to demonstrate scrolling behavior.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Test component to verify z-index fixes
</script>

<style scoped>
/* Custom scrollbar styling */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.5);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.7);
}

/* Firefox */
.custom-scrollbar:hover {
  scrollbar-color: rgba(148, 163, 184, 0.5) transparent;
}
</style>