/**
 * Local stub entities (Base44 disabled).
 * Exports the entity names used across the app (including common singular/plural aliases)
 * so the project builds and runs without Base44.
 *
 * Next step: replace these implementations with a real DB (Supabase/Firebase/etc).
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

// Core
export const Settings = makeEntity('Settings');
export const SlideSettings = makeEntity('SlideSettings');
export const Schedule = makeEntity('Schedule');

// Announcements
export const Announcement = makeEntity('Announcement');
export const Announcements = Announcement; // alias

// Zmanim
export const DailyZmanim = makeEntity('DailyZmanim');
export const Zmanim = DailyZmanim; // alias

export const ShabbatTimes = makeEntity('ShabbatTimes');

// Messages
export const SmartMessage = makeEntity('SmartMessage');
export const SmartMessages = SmartMessage; // alias

// Halacha/Halachot
export const Halachot = makeEntity('Halachot');
export const Halacha = makeEntity('Halacha'); // singular alias
export const HalachaYomit = makeEntity('HalachaYomit'); // alias

// Brachos
export const Brachos = makeEntity('Brachos');
export const Bracha = makeEntity('Bracha'); // singular alias

// Niftarim
export const Niftarim = makeEntity('Niftarim');
export const NiftarWeekly = makeEntity('NiftarWeekly');

// Refuah
export const RefuahShelema = makeEntity('RefuahShelema');

// Leiluy Nishmat
export const LeiluyNishmat = makeEntity('LeiluyNishmat');

// Community
export const CommunityGallery = makeEntity('CommunityGallery');
export const CommunityMessage = makeEntity('CommunityMessage');
export const CommunityMessages = CommunityMessage; // alias

// Chizuk
export const ChizukYomi = makeEntity('ChizukYomi');

// Generic container (some code might import Entities)
export const Entities = {
  Settings,
  SlideSettings,
  Schedule,
  Announcement,
  Announcements,
  DailyZmanim,
  Zmanim,
  ShabbatTimes,
  SmartMessage,
  SmartMessages,
  Halachot,
  Halacha,
  HalachaYomit,
  Brachos,
  Bracha,
  Niftarim,
  NiftarWeekly,
  RefuahShelema,
  LeiluyNishmat,
  CommunityGallery,
  CommunityMessage,
  CommunityMessages,
  ChizukYomi
};

