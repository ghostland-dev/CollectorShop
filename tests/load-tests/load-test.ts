/**
 * Script de test de charge pour Collector.shop POC
 * Utilise Artillery pour tester la montée en charge de l'application
 *
 * Installation : npm install
 * Exécution : npm run load-test
 *
 * Artillery utilise ce fichier comme "processor" pour les fonctions personnalisées
 */

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
    const url = new URL(`${baseUrl}/announcements`);
    url.searchParams.append('limit', '20');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    const data: AnnouncementsResponse = await response.json();

    // Vérifications
    const isSuccess = response.status === 200 && duration < 200;
    const hasData = data.announcements && Array.isArray(data.announcements);

    // Émettre les métriques
    events.emit('counter', 'catalog.requests', 1);
    events.emit('histogram', 'catalog.response_time', duration);

    if (isSuccess && hasData) {
      events.emit('counter', 'catalog.success', 1);

      // Stocker l'ID de la première annonce pour le test suivant
      if (data.announcements.length > 0) {
        context.vars.announcementId = data.announcements[0].id;
      }
    } else {
      events.emit('counter', 'catalog.errors', 1);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    events.emit('counter', 'catalog.errors', 1);
    events.emit('histogram', 'catalog.response_time', duration);

    if (error instanceof Error && error.name === 'AbortError') {
      events.emit('counter', 'catalog.errors.timeout', 1);
    } else {
      events.emit('counter', 'catalog.errors.unknown', 1);
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${baseUrl}/announcements/${announcementId}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    const data: Announcement = await response.json();

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

    if (error instanceof Error && error.name === 'AbortError') {
      events.emit('counter', 'announcement.errors.timeout', 1);
    } else {
      events.emit('counter', 'announcement.errors.unknown', 1);
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
    const url = new URL(`${baseUrl}/announcements`);
    url.searchParams.append('search', searchTerm);
    url.searchParams.append('limit', '10');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    const data: AnnouncementsResponse = await response.json();

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

    if (error instanceof Error && error.name === 'AbortError') {
      events.emit('counter', 'search.errors.timeout', 1);
    } else {
      events.emit('counter', 'search.errors.unknown', 1);
    }
  }
}

// Export CommonJS pour Artillery
module.exports = {
  getCatalog,
  getAnnouncement,
  searchCatalog,
};
