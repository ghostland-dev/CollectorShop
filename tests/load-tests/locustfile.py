"""
Tests de charge Locust — Collector.shop
========================================
Trois profils utilisateurs :
  • AnonymousBrowser  : parcourt le catalogue, consulte des annonces (40 %)
  • CatalogSearcher   : effectue des recherches par mot-clé (35 %)
  • HealthProbe       : sonde les endpoints techniques (25 %)

Exécution locale :
    locust -f locustfile.py --host https://api.shopcollector.local

Exécution headless (CI) :
    locust -f locustfile.py --host <URL> \
        --headless --users 50 --spawn-rate 5 --run-time 60s \
        --html report.html --csv stats --csv-full-history
"""

from __future__ import annotations

import random
from locust import HttpUser, TaskSet, between, events, tag, task
from locust.runners import MasterRunner, WorkerRunner


# ── Données de test ────────────────────────────────────────────────────────────

SEARCH_TERMS = ["pokémon", "timbre", "monnaie", "carte", "collection", "rare"]
CATEGORIES   = ["Cartes Pokémon", "Timbres", "Monnaies", "Collections"]
PAGE_SIZES   = [10, 20, 50]


# ── TaskSets ───────────────────────────────────────────────────────────────────

class CatalogTasks(TaskSet):
    """Navigation dans le catalogue (parcours anonyme)."""

    announcement_ids: list[str] = []

    def on_start(self) -> None:
        self._fetch_ids()

    def _fetch_ids(self) -> None:
        """Pré-charge une liste d'IDs pour les tests de détail."""
        with self.client.get(
            "/api/announcements?limit=20",
            name="/api/announcements [seed]",
            catch_response=True,
        ) as resp:
            if resp.status_code == 200:
                data = resp.json()
                self.announcement_ids = [
                    a["id"] for a in data.get("announcements", []) if "id" in a
                ]
            else:
                resp.failure(f"seed failed: HTTP {resp.status_code}")

    # ── Tâches ──

    @tag("catalog", "list")
    @task(4)
    def list_catalog(self) -> None:
        limit = random.choice(PAGE_SIZES)
        self.client.get(
            f"/api/announcements?limit={limit}&page=1",
            name="/api/announcements [list]",
        )

    @tag("catalog", "detail")
    @task(3)
    def view_announcement(self) -> None:
        if not self.announcement_ids:
            self._fetch_ids()
            return
        ann_id = random.choice(self.announcement_ids)
        with self.client.get(
            f"/api/announcements/{ann_id}",
            name="/api/announcements/:id",
            catch_response=True,
        ) as resp:
            if resp.status_code == 404:
                # L'annonce a pu être supprimée — ce n'est pas un échec CI
                resp.success()

    @tag("catalog", "paginate")
    @task(2)
    def paginate_catalog(self) -> None:
        page = random.randint(1, 3)
        self.client.get(
            f"/api/announcements?limit=20&page={page}",
            name="/api/announcements [paginate]",
        )

    @tag("catalog", "filter")
    @task(1)
    def filter_by_category(self) -> None:
        cat = random.choice(CATEGORIES)
        self.client.get(
            f"/api/announcements?category={cat}&limit=20",
            name="/api/announcements [filter:category]",
        )


class SearchTasks(TaskSet):
    """Recherches textuelles dans le catalogue."""

    @tag("search")
    @task(5)
    def search_keyword(self) -> None:
        term = random.choice(SEARCH_TERMS)
        self.client.get(
            f"/api/announcements?search={term}&limit=10",
            name="/api/announcements [search]",
        )

    @tag("search", "paginate")
    @task(2)
    def search_with_pagination(self) -> None:
        term = random.choice(SEARCH_TERMS)
        page = random.randint(1, 2)
        self.client.get(
            f"/api/announcements?search={term}&limit=10&page={page}",
            name="/api/announcements [search+page]",
        )

    @tag("search", "filter")
    @task(1)
    def search_with_filter(self) -> None:
        term = random.choice(SEARCH_TERMS)
        cat  = random.choice(CATEGORIES)
        self.client.get(
            f"/api/announcements?search={term}&category={cat}&limit=10",
            name="/api/announcements [search+filter]",
        )


class HealthTasks(TaskSet):
    """Sondes techniques / endpoints d'infrastructure."""

    @tag("health")
    @task(3)
    def health_check(self) -> None:
        with self.client.get("/health", name="/health", catch_response=True) as resp:
            if resp.status_code == 200:
                body = resp.json()
                if body.get("status") != "ok":
                    resp.failure(f"status != ok : {body}")
            else:
                resp.failure(f"HTTP {resp.status_code}")

    @tag("health", "api")
    @task(2)
    def api_root_announcements(self) -> None:
        with self.client.get(
            "/api/announcements?limit=1",
            name="/api/announcements [probe]",
            catch_response=True,
        ) as resp:
            if resp.status_code != 200:
                resp.failure(f"HTTP {resp.status_code}")
            elif "announcements" not in resp.json():
                resp.failure("champ 'announcements' absent")


# ── Profils utilisateurs ───────────────────────────────────────────────────────

class AnonymousBrowser(HttpUser):
    """Visiteur anonyme qui parcourt le catalogue."""

    weight    = 40
    tasks     = [CatalogTasks]
    wait_time = between(1, 3)


class CatalogSearcher(HttpUser):
    """Utilisateur orienté recherche."""

    weight    = 35
    tasks     = [SearchTasks]
    wait_time = between(0.5, 2)


class HealthProbe(HttpUser):
    """Sonde technique (monitoring, CI)."""

    weight    = 25
    tasks     = [HealthTasks]
    wait_time = between(2, 5)


# ── Hooks événements ──────────────────────────────────────────────────────────

@events.init.add_listener
def on_locust_init(environment, **kwargs) -> None:
    if isinstance(environment.runner, (MasterRunner, WorkerRunner)):
        return
    print("\n🦗  Locust initialisé — Collector.shop load tests")
    print(f"    Target : {environment.host}")
    print("    Profils : AnonymousBrowser (40%) | CatalogSearcher (35%) | HealthProbe (25%)\n")


@events.quitting.add_listener
def on_quitting(environment, **kwargs) -> None:
    stats = environment.runner.stats if environment.runner else None
    if not stats:
        return

    total   = stats.total
    req     = total.num_requests
    fail    = total.num_failures
    p95     = total.get_response_time_percentile(0.95) or 0
    p99     = total.get_response_time_percentile(0.99) or 0
    err_pct = (fail / req * 100) if req else 0

    print("\n" + "=" * 60)
    print("  RÉSUMÉ LOCUST")
    print("=" * 60)
    print(f"  Requêtes totales : {req}")
    print(f"  Échecs           : {fail}  ({err_pct:.1f} %)")
    print(f"  P95 latence      : {p95:.0f} ms")
    print(f"  P99 latence      : {p99:.0f} ms")

    ok = err_pct < 5 and p95 < 500
    print(f"  Verdict          : {'✅ OK' if ok else '⚠️  DÉGRADÉ'}")
    print("=" * 60 + "\n")

    # Code de sortie non-zéro si seuils dépassés (utile pour marquer le build)
    if not ok:
        environment.process_exit_code = 1
