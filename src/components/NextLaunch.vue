<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { format } from 'date-fns';
import type { Launch } from '../types/spacex';
import { getNextLaunch } from '../services/api';

const nextLaunch = ref<Launch | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
});

let countdownInterval: number | null = null;

const formattedDate = computed(() => {
  if (!nextLaunch.value) return '';
  return format(new Date(nextLaunch.value.date_utc), 'dd/MM/yyyy HH:mm:ss');
});

const updateCountdown = () => {
  if (!nextLaunch.value) return;
  
  const launchDate = new Date(nextLaunch.value.date_utc).getTime();
  const now = new Date().getTime();
  const distance = launchDate - now;
  
  if (distance < 0) {
    // Le lancement a déjà eu lieu
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return;
  }
  
  countdown.value = {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000)
  };
};

const fetchNextLaunch = async () => {
  try {
    loading.value = true;
    error.value = null;
    nextLaunch.value = await getNextLaunch();
    updateCountdown();
    
    // Démarage compte à rebours
    countdownInterval = setInterval(updateCountdown, 1000);
  } catch (err) {
    error.value = 'Échec du chargement des données de lancement suivantes';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchNextLaunch();
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>

<template>
  <section class="w-full max-w-4xl mx-auto mb-12">
    <div class="relative bg-space-medium rounded-xl p-6 overflow-hidden border border-space-light">
      <!-- Étoiles animées en arrière-plan -->
      <div v-for="i in 15" :key="i" 
           class="star animate-twinkle"
           :style="{
             width: `${Math.random() * 3 + 1}px`,
             height: `${Math.random() * 3 + 1}px`,
             top: `${Math.random() * 100}%`,
             left: `${Math.random() * 100}%`,
             animationDelay: `${Math.random() * 4}s`
           }">
      </div>
      
      <h2 class="text-2xl font-bold text-space-accent mb-4">Prochain lancement</h2>
      
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-space-accent"></div>
      </div>
      
      <div v-else-if="error" class="text-space-accent2 text-center py-4">
        {{ error }}
      </div>
      
      <div v-else-if="nextLaunch" class="space-y-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="text-xl font-bold text-white">{{ nextLaunch.name }}</h3>
            <p class="text-gray-300">{{ formattedDate }}</p>
          </div>
          
          <div class="mt-4 md:mt-0">
            <div class="flex gap-4 justify-center md:justify-end text-center">
              <div class="flex flex-col">
                <span class="countdown-value text-xl animate-pulse-slow">{{ countdown.days }}</span>
                <span class="text-sm text-gray-300 mt-1">Jours</span>
              </div>
              <div class="flex flex-col">
                <span class="countdown-value text-xl animate-pulse-slow">{{ countdown.hours }}</span>
                <span class="text-sm text-gray-300 mt-1">Heures</span>
              </div>
              <div class="flex flex-col">
                <span class="countdown-value text-xl animate-pulse-slow">{{ countdown.minutes }}</span>
                <span class="text-sm text-gray-300 mt-1">Minutes</span>
              </div>
              <div class="flex flex-col">
                <span class="countdown-value text-xl animate-pulse-slow">{{ countdown.seconds }}</span>
                <span class="text-sm text-gray-300 mt-1">Secondes</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="nextLaunch.links.patch.small" class="flex justify-center">
          <img 
            :src="nextLaunch.links.patch.small" 
            :alt="`${nextLaunch.name} mission patch`"
            class="h-24 md:h-32 animate-float" 
          />
        </div>
      </div>
      
      <div v-else class="text-center py-4">
        <p>Aucun prochain lancement disponible</p>
      </div>
    </div>
  </section>
</template>