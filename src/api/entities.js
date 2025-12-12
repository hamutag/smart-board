/** Auto-generated stub entities (Base44 disabled) */

function makeEntity(name) {
  let store = [];
  return {
    name,
    async list() { return store; },
    async get(id) { return store.find(x => x?.id === id) ?? null; },
    async create(data) {
      const id = ${Date.now()}-;
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

export const Announcement = makeEntity('Announcement');
export const BoardSchedule = makeEntity('BoardSchedule');
export const Bracha = makeEntity('Bracha');
export const ChizukEntity = makeEntity('ChizukEntity');
export const ChizukYomi = makeEntity('ChizukYomi');
export const CommunityGallery = makeEntity('CommunityGallery');
export const CommunityMessage = makeEntity('CommunityMessage');
export const DailyZmanim = makeEntity('DailyZmanim');
export const DesignTemplate = makeEntity('DesignTemplate');
export const Halacha = makeEntity('Halacha');
export const LeiluyNishmat = makeEntity('LeiluyNishmat');
export const NiftarWeekly = makeEntity('NiftarWeekly');
export const RefuahShelema = makeEntity('RefuahShelema');
export const Settings = makeEntity('Settings');
export const ShabbatTimes = makeEntity('ShabbatTimes');
export const SlideSettings = makeEntity('SlideSettings');
export const SmartMessage = makeEntity('SmartMessage');

export const Entities = {
  Announcement,
  BoardSchedule,
  Bracha,
  ChizukEntity,
  ChizukYomi,
  CommunityGallery,
  CommunityMessage,
  DailyZmanim,
  DesignTemplate,
  Halacha,
  LeiluyNishmat,
  NiftarWeekly,
  RefuahShelema,
  Settings,
  ShabbatTimes,
  SlideSettings,
  SmartMessage,
};
