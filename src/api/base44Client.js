/* Local stub: keep imports working without Base44 */
import Entities from './entities.js';

export const base44 = {
  Entities,
  entities: Entities,

  // Optional helpers used in some pages
  async ping() { return true; }
};

export default base44;
