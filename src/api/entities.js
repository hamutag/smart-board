/** Universal stub entities – Base44 fully disabled */

function makeEntity(name) {
  let store = [];
  return {
    name,
    async list() { return store; },
    async get(id) { return store.find(x => x?.id === id) ?? null; },
    async create(data) {
      const id = `${Date.now()}-${Math.random()}`;
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

const registry = new Proxy({}, {
  get(target, prop) {
    if (!target[prop]) {
      target[prop] = makeEntity(prop);
    }
    return target[prop];
  }
});

// Explicit exports used across the app
export const Settings = registry.Settings;
export const SlideSettings = registry.SlideSettings;
export const Schedule = registry.Schedule;
export const Announcement = registry.Announcement;
export const Announcements = registry.Announcement;
export const DailyZmanim = registry.DailyZmanim;
export const Zmanim = registry.DailyZmanim;
export const ShabbatTimes = registry.ShabbatTimes;
export const SmartMessage = registry.SmartMessage;
export const SmartMessages = registry.SmartMessage;
export const Halachot = registry.Halachot;
export const Halacha = registry.Halacha;
export const HalachaYomit = registry.HalachaYomit;
export const Brachos = registry.Brachos;
export const Bracha = registry.Bracha;
export const Niftarim = registry.Niftarim;
export const NiftarWeekly = registry.NiftarWeekly;
export const RefuahShelema = registry.RefuahShelema;
export const LeiluyNishmat = registry.LeiluyNishmat;
export const CommunityGallery = registry.CommunityGallery;
export const CommunityMessage = registry.CommunityMessage;
export const CommunityMessages = registry.CommunityMessage;
export const ChizukYomi = registry.ChizukYomi;
export const DesignTemplate = registry.DesignTemplate;

// Generic container
export const Entities = registry;
