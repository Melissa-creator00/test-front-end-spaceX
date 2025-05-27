import axios from 'axios';
import type { Launch, LaunchDoc, Launchpad, Payload, LaunchFilter } from '../types/spacex';

const API_URL =  'https://api.spacexdata.com/v5';

// Créer une instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getNextLaunch = async (): Promise<Launch> => {
  try {
    const response = await api.post<LaunchDoc>('/launches/query', {
      query: {
        upcoming: true,
      },
      options: {
        limit: 1,
        sort: {
          date_unix: 'asc',
        },
      },
    });
    
    return response.data.docs[0];
  } catch (error) {
    console.error('Erreur lors de la récupération de la prochaine lancement:', error);
    throw error;
  }
};

export const getLatestLaunches = async (filter: LaunchFilter): Promise<Launch[]> => {
  try {
    const query: Record<string, any> = { upcoming: false };
    
    if (filter === 'success') {
      query.success = true;
    } else if (filter === 'failed') {
      query.success = false;
    }
    
    const response = await api.post<LaunchDoc>('/launches/query', {
      query,
      options: {
        limit: 10,
        sort: {
          date_unix: 'desc',
        },
      },
    });
    
    return response.data.docs;
  } catch (error) {
    console.error('Erreur lors de la récupération des derniers lancements :', error);
    throw error;
  }
};

export const getLaunchpad = async (launchpadId: string): Promise<Launchpad> => {
  try {
    const response = await api.get<Launchpad>(`/launchpads/${launchpadId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du launchpad :', error);
    throw error;
  }
};

export const getPayloads = async (payloadIds: string[]): Promise<Payload[]> => {
  try {
    const payloads: Payload[] = [];
    
//on récupére chaque charge utile individuellement car il n'y a pas de point de terminaison par lots.    
for (const payloadId of payloadIds) {
      const response = await api.get<Payload>(`/payloads/${payloadId}`);
      payloads.push(response.data);
    }
    
    return payloads;
  } catch (error) {
    console.error('Erreur lors de la récupération des charges utiles :', error);
    throw error;
  }
};