<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { format } from 'date-fns';
import type { Launch } from '../types/spacex';

const props = defineProps<{
  launch: Launch
}>();

const emit = defineEmits<{
  (e: 'select', launch: Launch): void
}>();

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd/MM/yyyy');
};

const handleClick = () => {
  emit('select', props.launch);
};
</script>

<template>
  <div class="launch-card" @click="handleClick">
    <div class="flex items-start">
      <div v-if="launch.links.patch.small" class="flex-shrink-0 mr-4">
        <img 
          :src="launch.links.patch.small" 
          :alt="`${launch.name} mission patch`"
          class="h-16 w-16 object-contain" 
        />
      </div>
      
      <div class="flex-grow">
        <h3 class="launch-title">{{ launch.name }}</h3>
        <p class="text-gray-300">{{ formatDate(launch.date_utc) }}</p>
        
        <div class="mt-2">
          <span 
            class="inline-block px-2 py-1 text-xs rounded-full" 
            :class="launch.success ? 'bg-space-success/20 text-space-success' : 
                   launch.upcoming ? 'bg-yellow-600/20 text-yellow-500' : 'bg-space-failed/20 text-space-failed'"
          >
            {{ launch.success ? 'Réussi' : launch.upcoming ? 'À venir' : 'Échoué' }}
          </span>
        </div>
      </div>
    </div>
    
    <p v-if="launch.details" class="mt-3 text-sm text-gray-300 line-clamp-2">
      {{ launch.details }}
    </p>
  </div>
</template>