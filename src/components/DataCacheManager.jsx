// Global Data Cache Manager
// Loads all data once on app start and refreshes every 2 hours

// Persist cache across refreshes so the board does NOT re-download everything
// on every page reload (massive data saver on tablets/TV sticks).
const STORAGE_KEY = 'smartboard:dataCache:v2';

class DataCacheManager {
  constructor() {
    this.cache = {
      settings: null,
      dailyZmanim: null,
      announcements: null,
      niftarim: null,
      refuah: null,
      halachot: null,
      brachot: null,
      leiluyNishmat: null,
      communityGallery: null,
      communityMessages: null,
      shabbatTimes: null,
      slideSettings: null,
      boardSchedule: null,
      chizukYomi: null
    };
    
    this.loading = false;
    this.lastLoadTime = null;
    this.subscribers = new Set();
    this.REFRESH_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours

    // Try to restore a recent cache immediately (fast startup)
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      // If we had anything in storage, let listeners render it right away
      if (this.lastLoadTime) {
        this.notifySubscribers();
        this.scheduleRefresh();
      }
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.cache));
  }

  isExpired() {
    if (!this.lastLoadTime) return true;
    return Date.now() - this.lastLoadTime > this.REFRESH_INTERVAL;
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return false;
      if (parsed.cache && typeof parsed.cache === 'object') {
        this.cache = { ...this.cache, ...parsed.cache };
      }
      this.lastLoadTime = Number(parsed.lastLoadTime) || null;
      return true;
    } catch {
      return false;
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ cache: this.cache, lastLoadTime: this.lastLoadTime })
      );
    } catch {
      // Storage can be full/disabled – ignore
    }
  }

  async loadAllData() {
    if (this.loading) return this.cache;
    
    this.loading = true;
    console.log('[DataCache] Loading all data...');
    
    try {
      const { base44 } = await import('@/api/base44Client');
      
      // Get today's date
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      
      // Load all data in parallel with delays between calls to avoid rate limits
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Settings
      this.cache.settings = await base44.entities.Settings.list();
      await delay(150);
      
      // Daily Zmanim
      this.cache.dailyZmanim = await base44.entities.DailyZmanim.filter({ date: formattedDate });
      await delay(150);
      
      // Announcements
      this.cache.announcements = await base44.entities.Announcement.filter({ active: true }, '-priority');
      await delay(150);
      
      // Niftarim
      this.cache.niftarim = await base44.entities.NiftarWeekly.filter({ active: true });
      await delay(150);
      
      // Refuah
      this.cache.refuah = await base44.entities.RefuahShelema.filter({ active: true }, 'priority');
      await delay(150);
      
      // Halachot
      this.cache.halachot = await base44.entities.Halacha.filter({ active: true }, 'order');
      await delay(150);
      
      // Brachot
      this.cache.brachot = await base44.entities.Bracha.filter({ active: true }, 'order');
      await delay(150);
      
      // Leiluy Nishmat
      this.cache.leiluyNishmat = await base44.entities.LeiluyNishmat.list('order');
      await delay(150);
      
      // Community Gallery
      this.cache.communityGallery = await base44.entities.CommunityGallery.filter({ active: true }, 'order');
      await delay(150);
      
      // Community Messages
      this.cache.communityMessages = await base44.entities.CommunityMessage.filter({ active: true });
      await delay(150);
      
      // Shabbat Times
      this.cache.shabbatTimes = await base44.entities.ShabbatTimes.filter({ active: true });
      await delay(150);
      
      // Slide Settings
      this.cache.slideSettings = await base44.entities.SlideSettings.list({ sort: { updated_date: -1 }, limit: 100 });
      await delay(150);
      
      // Board Schedule
      this.cache.boardSchedule = await base44.entities.BoardSchedule.list();
      await delay(150);
      
      // Chizuk Yomi
      this.cache.chizukYomi = await base44.entities.ChizukYomi.list('order');
      
      this.lastLoadTime = Date.now();
      this.saveToStorage();
      console.log('[DataCache] All data loaded successfully at:', new Date().toLocaleTimeString());
      
      this.notifySubscribers();
      
      // Schedule next refresh
      this.scheduleRefresh();
      
    } catch (error) {
      console.error('[DataCache] Error loading data:', error);
    } finally {
      this.loading = false;
    }
    
    return this.cache;
  }

  scheduleRefresh() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);

    // If we already have a last load time, align refresh to exactly "every 2 hours"
    const elapsed = this.lastLoadTime ? (Date.now() - this.lastLoadTime) : this.REFRESH_INTERVAL;
    const remaining = Math.max(this.REFRESH_INTERVAL - elapsed, 5 * 1000);

    this.refreshTimer = setTimeout(() => {
      console.log('[DataCache] Auto-refreshing data...');
      this.loadAllData();
    }, remaining);
  }

  getCache() {
    return this.cache;
  }

  isLoaded() {
    return this.lastLoadTime !== null;
  }

  async ensureLoaded() {
    // If we already loaded something (in-memory or from storage) and it's still fresh – use it.
    if (this.isLoaded() && !this.isExpired()) {
      this.scheduleRefresh();
      return this.cache;
    }

    // If we have stale data from storage – return it quickly and refresh in the background.
    if (this.isLoaded() && this.isExpired()) {
      this.scheduleRefresh();
      this.loadAllData().catch(() => {});
      return this.cache;
    }

    // First run (no storage) – actually wait for a real load.
    if (!this.loading) {
      await this.loadAllData();
    }
    return this.cache;
  }

  forceRefresh() {
    return this.loadAllData();
  }
}

// Global singleton instance
export const dataCache = new DataCacheManager();

// Initialize on import (best-effort, but don't force re-download if localStorage is fresh)
if (typeof window !== 'undefined') {
  dataCache.ensureLoaded().catch(() => {});
}