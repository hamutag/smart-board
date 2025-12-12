/* Local DB stubs with persistence (no Base44). */

const SINGLETONS = new Set([
  'Settings',
  'SlideSettings',
  'ShabbatTimes',
  'BoardSchedule',
  'Schedule'
]);

function safeParse(json, fallback) {
  try { return JSON.parse(json); } catch { return fallback; }
}

function storageKey(name) {
  return `smartboard:${name}`;
}

function loadStore(name) {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(storageKey(name));
  const arr = safeParse(raw, []);
  return Array.isArray(arr) ? arr : [];
}

function saveStore(name, arr) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(storageKey(name), JSON.stringify(arr));
}

function ensureSingleton(name, arr) {
  if (!SINGLETONS.has(name)) return arr;
  if (arr.length > 0) return arr;
  const item = { id: 'default' };
  arr.push(item);
  return arr;
}

function makeEntity(name) {
  let store = ensureSingleton(name, loadStore(name));

  function persist() {
    saveStore(name, store);
  }

  return {
    name,

    async list() {
      store = ensureSingleton(name, loadStore(name));
      return store;
    },

    async get(id) {
      store = ensureSingleton(name, loadStore(name));
      return store.find(x => x && x.id === id) ?? null;
    },

    async create(data) {
      store = ensureSingleton(name, loadStore(name));
      const id = (globalThis.crypto && globalThis.crypto.randomUUID)
        ? globalThis.crypto.randomUUID()
        : (Date.now() + '-' + Math.random().toString(16).slice(2));
      const item = { id, ...(data || {}) };
      store.push(item);
      persist();
      return item;
    },

    async update(id, data) {
      store = ensureSingleton(name, loadStore(name));
      const i = store.findIndex(x => x && x.id === id);
      if (i === -1) return null;
      store[i] = { ...store[i], ...(data || {}), id };
      persist();
      return store[i];
    },

    async remove(id) {
      store = ensureSingleton(name, loadStore(name));
      const i = store.findIndex(x => x && x.id === id);
      if (i === -1) return false;
      store.splice(i, 1);
      persist();
      return true;
    }
  };
}

/* Export every entity name the app imports */
export const Settings = makeEntity('Settings');
export const SlideSettings = makeEntity('SlideSettings');
export const Schedule = makeEntity('Schedule');
export const BoardSchedule = makeEntity('BoardSchedule');
export const Announcement = makeEntity('Announcement');
export const Announcements = Announcement;
export const DailyZmanim = makeEntity('DailyZmanim');
export const Zmanim = DailyZmanim;
export const ShabbatTimes = makeEntity('ShabbatTimes');
export const SmartMessage = makeEntity('SmartMessage');
export const SmartMessages = SmartMessage;
export const Halacha = makeEntity('Halacha');
export const Halachot = makeEntity('Halachot');
export const HalachaYomit = makeEntity('HalachaYomit');
export const Bracha = makeEntity('Bracha');
export const Brachos = makeEntity('Brachos');
export const Niftarim = makeEntity('Niftarim');
export const NiftarWeekly = makeEntity('NiftarWeekly');
export const RefuahShelema = makeEntity('RefuahShelema');
export const LeiluyNishmat = makeEntity('LeiluyNishmat');
export const CommunityGallery = makeEntity('CommunityGallery');
export const CommunityMessage = makeEntity('CommunityMessage');
export const CommunityMessages = CommunityMessage;
export const ChizukYomi = makeEntity('ChizukYomi');
export const DesignTemplate = makeEntity('DesignTemplate');

export const Entities = {
  Settings,
  SlideSettings,
  Schedule,
  BoardSchedule,
  Announcement,
  Announcements,
  DailyZmanim,
  Zmanim,
  ShabbatTimes,
  SmartMessage,
  SmartMessages,
  Halacha,
  Halachot,
  HalachaYomit,
  Bracha,
  Brachos,
  Niftarim,
  NiftarWeekly,
  RefuahShelema,
  LeiluyNishmat,
  CommunityGallery,
  CommunityMessage,
  CommunityMessages,
  ChizukYomi,
  DesignTemplate
};

export default Entities;
