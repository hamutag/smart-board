const API = "/api/entities";

async function req(method, entity, id, data) {
  const url = new URL(API, window.location.origin);
  url.searchParams.set("entity", entity);
  if (id) url.searchParams.set("id", id);

  const res = await fetch(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`API ${method} ${entity} failed: ${res.status} ${t}`);
  }
  return await res.json();
}

function makeEntity(entityName) {
  return {
    name: entityName,
    async list() {
      const out = await req("GET", entityName);
      return Array.isArray(out) ? out : [];
    },
    async get(id) {
      if (!id) return null;
      return await req("GET", entityName, id);
    },
    async create(data) {
      return await req("POST", entityName, null, data || {});
    },
    async update(id, data) {
      if (!id) return null;
      return await req("PUT", entityName, id, data || {});
    },
    async remove(id) {
      if (!id) return false;
      await req("DELETE", entityName, id);
      return true;
    },
  };
}

export const Settings = makeEntity("Settings");
export const SlideSettings = makeEntity("SlideSettings");
export const Schedule = makeEntity("Schedule");
export const BoardSchedule = makeEntity("BoardSchedule");

export const Announcement = makeEntity("Announcement");
export const Announcements = Announcement;

export const DailyZmanim = makeEntity("DailyZmanim");
export const Zmanim = DailyZmanim;

export const ShabbatTimes = makeEntity("ShabbatTimes");

export const SmartMessage = makeEntity("SmartMessage");
export const SmartMessages = SmartMessage;

export const Halacha = makeEntity("Halacha");
export const Halachot = Halacha;
export const HalachaYomit = makeEntity("HalachaYomit");

export const Bracha = makeEntity("Bracha");
export const Brachos = Bracha;

export const Niftarim = makeEntity("Niftarim");
export const NiftarWeekly = makeEntity("NiftarWeekly");

export const RefuahShelema = makeEntity("RefuahShelema");
export const LeiluyNishmat = makeEntity("LeiluyNishmat");

export const CommunityGallery = makeEntity("CommunityGallery");
export const CommunityMessage = makeEntity("CommunityMessage");
export const CommunityMessages = CommunityMessage;

export const ChizukYomi = makeEntity("ChizukYomi");

export const DesignTemplate = makeEntity("DesignTemplate");

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
  DesignTemplate,
};
