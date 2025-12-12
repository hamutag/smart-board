/**
 * Base44 disabled.
 * We still export `base44` because some pages import it.
 * This stub prevents redirects and keeps the build working.
 */

export const base44 = {
  enabled: false,
  auth: {
    async login() { throw new Error("Base44 disabled"); },
    async logout() { return true; },
    async getSession() { return null; }
  },
  async request() { throw new Error("Base44 disabled"); }
};

export function isBase44Enabled() {
  return false;
}

export function getBase44Client() {
  return null;
}
