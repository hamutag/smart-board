/**
 * Local stub entities (Base44 disabled).
 * This file exports the same entity names used across the app,
 * but stores data locally (in-memory) so build/runtime won't redirect to Base44.
 *
 * Next step: replace implementations with a real DB (Supabase/Firebase/etc).
 */

function makeEntity(name) {
  let store = [];

  return {
    name,

    async list() {
      return store;
    },

    async get(id) {
      return store.find(x => x?.id === id) ?? null;
    },

    async create(data) {
      const id = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
      const item = { id, ...data };
      store.push(item);
      return item;
    },

    async update(id, data) {
      const i = store.findIndex(x => x?.id === id);
      if (i === -1) return null;
      store[i] = { ...store[i], ...data, id };
      return store[i];
    },

    async remove(id) {
      const i = store.findIndex(x => x?.id === id);
      if (i === -1) return false;
      store.splice(i, 1);
      return true;
    }
  };
}

// Export all entities referenced by pages/components
export const Settings = makeEntity('Settings');
export const Announcement = makeEntity('Announcement');
export const DailyZmanim = makeEntity('DailyZmanim');
export const ShabbatTimes = makeEntity('ShabbatTimes');
export const SlideSettings = makeEntity('SlideSettings');
export const SmartMessage = makeEntity('SmartMessage');
export const Brachos = makeEntity('Brachos');
export const Halachot = makeEntity('Halachot');
export const Niftarim = makeEntity('Niftarim');
export const RefuahShelema = makeEntity('RefuahShelema');
export const LeiluyNishmat = makeEntity('LeiluyNishmat');
export const CommunityGallery = makeEntity('CommunityGallery');
export const Schedule = makeEntity('Schedule');

// Also keep a generic export if some code imports Entities
export const Entities = {
  Settings,
  Announcement,
  DailyZmanim,
  ShabbatTimes,
  SlideSettings,
  SmartMessage,
  Brachos,
  Halachot,
  Niftarim,
  RefuahShelema,
  LeiluyNishmat,
  CommunityGallery,
  Schedule
};
