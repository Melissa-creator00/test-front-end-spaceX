<script setup lang="ts">
import { ref } from 'vue';
import type { Launch } from './types/spacex';
import NextLaunch from './components/NextLaunch.vue';
import LaunchList from './components/LaunchList.vue';
import LaunchCard from './components/LaunchCard.vue';
import LaunchModal from './components/LaunchModal.vue';

const selectedLaunch = ref<Launch | null>(null);
const showModal = ref(false);

const handleLaunchSelect = (launch: Launch) => {
  selectedLaunch.value = launch;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-space-dark pb-12">
    <!-- Étoiles de fond -->
    <div class="fixed inset-0 z-0 overflow-hidden">
      <div v-for="i in 100" :key="i" 
           class="star"
           :style="{
             width: `${Math.random() * 3 + 1}px`,
             height: `${Math.random() * 3 + 1}px`,
             top: `${Math.random() * 100}%`,
             left: `${Math.random() * 100}%`,
             animationDelay: `${Math.random() * 10}s`
           }">
      </div>
    </div>
    
    <header class="relative py-8 bg-gradient-to-b from-space-dark to-transparent mb-8">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl md:text-5xl font-bold text-center text-white">
          <span class="text-space-accent">Space</span>X <span class="text-space-accent2">Exploration</span>
        </h1>
        <p class="text-center text-gray-400 mt-2">Suivez les derniers lancements de SpaceX</p>
      </div>
    </header>
    
    <main class="relative z-10 container mx-auto px-4">
      <NextLaunch />
      
      <LaunchList @select="handleLaunchSelect" />
      
      <LaunchModal 
        :launch="selectedLaunch" 
        :show="showModal"
        @close="closeModal"
      />
    </main>
  </div>
</template>