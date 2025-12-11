/**
 * Script de test de charge pour Collector.shop POC
 * Utilise Artillery pour tester la montée en charge de l'application
 * 
 * Installation : npm install
 * Exécution : npm run load-test
 * 
 * Artillery utilise ce fichier comme "processor" pour les fonctions personnalisées
 */

import axios, { AxiosResponse } from 'axios';

interface Announcement {
  id: string;
  title: string;
  description: string;
  price: number;
  images?: string[];
}

interface AnnouncementsResponse {
  announcements: Announcement[];
  total?: number;
  page?: number;
  limit?: number;
}

interface ArtilleryContext {
  vars: {
    baseUrl: string;
    announcementId?: string;
  };
  [key: string]: unknown;
}

interface ArtilleryEvents {
  emit: (event: string, metric: string, value: number) => void;
  [key: string]: unknown;
}

/**
 * Scénario 1 : Consultation du catalogue
 */
async function getCatalog(context: ArtilleryContext, events: ArtilleryEvents): Promise<void> {
  const startTime = Date.now();
  const baseUrl = context.vars.baseUrl;

  try {
    const response: AxiosResponse<AnnouncementsResponse> = await axios.get(
      `${baseUrl}/announcements`,
      {
        params: { limit: 20 },
        timeout: 5000,
      }
    );

    const duration = Date.now() - startTime;

    // Vérifications
    const isSuccess = response.status === 200 && duration < 200;
    const hasData = response.data.announcements && Array.isArray(response.data.announcements);

    // Émettre les métriques
    events.emit('counter', 'catalog.requests', 1);
    events.emit('histogram', 'catalog.response_time', duration);

    if (isSuccess && hasData) {
      events.emit('counter', 'catalog.success', 1);
      
      // Stocker l'ID de la première annonce pour le test suivant
      if (response.data.announcements.length > 0) {
        context.vars.announcementId = response.data.announcements[0].id;
      }
    } else {
      events.emit('counter', 'catalog.errors', 1);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    events.emit('counter', 'catalog.errors', 1);
    events.emit('histogram', 'catalog.response_time', duration);
    
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 'unknown';
      events.emit('counter', `catalog.errors.${statusCode}`, 1);
    }
  }
}

/**
 * Scénario 2 : Consultation d'une annonce spécifique
 */
async function getAnnouncement(context: ArtilleryContext, events: ArtilleryEvents): Promise<void> {
  const announcementId = context.vars.announcementId;
  
  if (!announcementId) {
    return; // Pas d'annonce disponible, skip ce test
  }

  const startTime = Date.now();
  const baseUrl = context.vars.baseUrl;

  try {
    const response: AxiosResponse<Announcement> = await axios.get(
      `${baseUrl}/announcements/${announcementId}`,
      {
        timeout: 5000,
      }
    );

    const duration = Date.now() - startTime;

    // Vérifications
    const isSuccess = response.status === 200 && duration < 150;

    // Émettre les métriques
    events.emit('counter', 'announcement.requests', 1);
    events.emit('histogram', 'announcement.response_time', duration);

    if (isSuccess) {
      events.emit('counter', 'announcement.success', 1);
    } else {
      events.emit('counter', 'announcement.errors', 1);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    events.emit('counter', 'announcement.errors', 1);
    events.emit('histogram', 'announcement.response_time', duration);
    
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 'unknown';
      events.emit('counter', `announcement.errors.${statusCode}`, 1);
    }
  }
}

/**
 * Scénario 3 : Recherche dans le catalogue
 */
async function searchCatalog(context: ArtilleryContext, events: ArtilleryEvents): Promise<void> {
  const startTime = Date.now();
  const baseUrl = context.vars.baseUrl;

  const searchTerms = ['timbre', 'monnaie', 'carte', 'collection'];
  const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

  try {
    const response: AxiosResponse<AnnouncementsResponse> = await axios.get(
      `${baseUrl}/announcements`,
      {
        params: { search: searchTerm, limit: 10 },
        timeout: 5000,
      }
    );

    const duration = Date.now() - startTime;

    // Vérifications
    const isSuccess = response.status === 200 && duration < 200;

    // Émettre les métriques
    events.emit('counter', 'search.requests', 1);
    events.emit('histogram', 'search.response_time', duration);

    if (isSuccess) {
      events.emit('counter', 'search.success', 1);
    } else {
      events.emit('counter', 'search.errors', 1);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    events.emit('counter', 'search.errors', 1);
    events.emit('histogram', 'search.response_time', duration);
    
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 'unknown';
      events.emit('counter', `search.errors.${statusCode}`, 1);
    }
  }
}

// Export CommonJS pour Artillery
module.exports = {
  getCatalog,
  getAnnouncement,
  searchCatalog,
};
