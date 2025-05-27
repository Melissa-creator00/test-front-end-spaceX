<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { Launch, LaunchFilter } from '../types/spacex';
import { getLatestLaunches } from '../services/api';
import LaunchCard from './LaunchCard.vue';

const launches = ref<Launch[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const filter = ref<LaunchFilter>('all');

const fetchLaunches = async () => {
  try {
    loading.value = true;
    error.value = null;
    launches.value = await getLatestLaunches(filter.value);
  } catch (err) {
    error.value = 'Échec du chargement des lancements';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLaunches();
});

watch(filter, () => {
  fetchLaunches();
});

const handleFilterChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  filter.value = select.value as LaunchFilter;
};
</script>

<template>
  <section class="w-full max-w-4xl mx-auto">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <h2 class="text-2xl font-bold text-space-accent mb-4 md:mb-0">Derniers lancements</h2>
      
      <div class="w-full md:w-auto">
        <select 
          v-model="filter" 
          @change="handleFilterChange"
          class="filter-select w-full md:w-auto"
        >
          <option value="all">Tous les lancements</option>
          <option value="success">Lancements réussis</option>
          <option value="failed">Lancements échoués</option>
        </select>
      </div>
    </div>
    
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-space-accent"></div>
    </div>
    
    <div v-else-if="error" class="text-space-accent2 text-center py-4">
      {{ error }}
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LaunchCard 
        v-for="launch in launches" 
        :key="launch.id" 
        :launch="launch" 
      />
    </div>
    
    <div v-if="launches.length === 0 && !loading && !error" class="text-center py-8">
      <p>Aucun lancement trouvé</p>
    </div>
  </section>
</template>