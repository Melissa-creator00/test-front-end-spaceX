<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, watch } from 'vue';
import { format } from 'date-fns';
import type { Launch, Launchpad, Payload } from '../types/spacex';
import { getLaunchpad, getPayloads } from '../services/api';

const props = defineProps<{
  launch: Launch | null;
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const launchpad = ref<Launchpad | null>(null);
const payloads = ref<Payload[]>([]);
const loading = ref(false);
const showVideo = ref(false);

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd/MM/yyyy');
};

const fetchLaunchDetails = async () => {
  if (!props.launch) return;
  
  try {
    loading.value = true;
    
    // Récupérer les détails du Launchpad
    if (props.launch.launchpad) {
      launchpad.value = await getLaunchpad(props.launch.launchpad);
    }
    
    // Récupérer les détails de la charge utile
    if (props.launch.payloads && props.launch.payloads.length > 0) {
      payloads.value = await getPayloads(props.launch.payloads);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de lancement :', error);
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  emit('close');
  // Reset l'état de la vidéo lors de la fermeture de la fenêtre
  showVideo.value = false;
};

// Gérer les clics en dehors de la modale pour la fermer
const handleOutsideClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains('modal-overlay')) {
    closeModal();
  }
};

// Manipuler la touche Échap pour fermer la fenêtre 
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  
  // Récupérer les détails lorsque la fenêtre est affichée pour la première fois
  if (props.show && props.launch) {
    fetchLaunchDetails();
  }
});

// Récupérer les détails lorsque le lancement change
watch(() => props.launch, (newLaunch) => {
  if (newLaunch && props.show) {
    fetchLaunchDetails();
  }
});

// Nettoyer les événements
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

const onUnmounted = () => {
  document.removeEventListener('keydown', handleKeyDown);
};
</script>

<template>
  <Teleport to="body">
    <div v-if="show" 
         class="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
         @click="handleOutsideClick">
      <div class="modal-content p-6">
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-space-accent"></div>
        </div>
        
        <div v-else-if="launch" class="space-y-6">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-white">{{ launch.name }}</h2>
              <p class="text-gray-300">{{ formatDate(launch.date_utc) }}</p>
            </div>
            
            <button 
              @click="closeModal"
              class="text-gray-400 hover:text-white focus:outline-none"
              aria-label="Close modal"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="flex flex-col md:flex-row gap-6">
            <div class="md:w-1/3 flex flex-col items-center">
              <img 
                v-if="launch.links.patch.large" 
                :src="launch.links.patch.large" 
                :alt="`${launch.name} mission patch`"
                class="w-full max-w-[200px] mx-auto"
              />
              
              <div v-if="launch.links.article" class="mt-4 w-full">
                <a 
                  :href="launch.links.article" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="block w-full text-center bg-space-light hover:bg-space-accent hover:text-space-dark py-2 px-4 rounded transition-colors duration-200"
                >
                  Article détaillé
                </a>
              </div>
            </div>
            
            <div class="md:w-2/3">
              <p v-if="launch.details" class="text-gray-200 mb-4">{{ launch.details }}</p>
              
              <div class="space-y-4">
                <div v-if="launchpad">
                  <h3 class="section-title">Lieu de lancement</h3>
                  <p>{{ launchpad.name }}</p>
                </div>
                
                <div v-if="payloads.length > 0">
                  <h3 class="section-title">Chargements (Payloads)</h3>
                  <ul class="list-disc list-inside">
                    <li v-for="payload in payloads" :key="payload.id">
                      {{ payload.name }} ({{ payload.type }})
                    </li>
                  </ul>
                  
                  <h3 class="section-title mt-4">Clients</h3>
                  <ul class="list-disc list-inside">
                    <li v-for="(customer, index) in [
                      ...new Set(
                        payloads.flatMap(payload => payload.customers)
                      )
                    ]" :key="index">
                      {{ customer }}
                    </li>
                  </ul>
                </div>
                
                <div v-if="launch.links.youtube_id" class="mt-6">
                  <div class="flex items-center mb-2">
                    <label class="inline-flex items-center cursor-pointer">
                      <input type="checkbox" v-model="showVideo" class="sr-only peer">
                      <div class="relative w-11 h-6 bg-space-light peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-space-accent/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-space-accent"></div>
                      <span class="ms-3 text-sm font-medium text-gray-300">Afficher la vidéo</span>
                    </label>
                  </div>
                  
                  <div v-if="showVideo" class="mt-2 aspect-video">
                    <iframe 
                      :src="`https://www.youtube.com/embed/${launch.links.youtube_id}`" 
                      class="w-full h-full rounded"
                      title="YouTube video player" 
                      frameborder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>