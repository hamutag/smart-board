import pg from "pg";

const { Pool } = pg;

let pool;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("Missing DATABASE_URL env var");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function ensureSchema() {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS entity_items (
      id TEXT PRIMARY KEY,
      entity TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_entity_items_entity ON entity_items(entity);
  `);
}

function makeId() {
  return (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export default async function handler(req, res) {
  try {
    await ensureSchema();

    const url = new URL(req.url, `http://${req.headers.host}`);
    const entity = url.searchParams.get("entity");
    const id = url.searchParams.get("id");

    if (!entity) return json(res, 400, { error: "Missing entity" });

    const p = getPool();

    if (req.method === "GET") {
      if (id) {
        const r = await p.query(
          "SELECT id, data, created_at, updated_at FROM entity_items WHERE entity=$1 AND id=$2 LIMIT 1",
          [entity, id]
        );
        if (r.rowCount === 0) return json(res, 404, { error: "Not found" });
        return json(res, 200, { id: r.rows[0].id, ...r.rows[0].data });
      } else {
        const r = await p.query(
          "SELECT id, data, created_at, updated_at FROM entity_items WHERE entity=$1 ORDER BY created_at DESC",
          [entity]
        );
        const items = r.rows.map(x => ({ id: x.id, ...x.data }));
        return json(res, 200, items);
      }
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", chunk => (body += chunk));
      req.on("end", async () => {
        const data = body ? JSON.parse(body) : {};
        const newId = makeId();
        await p.query(
          "INSERT INTO entity_items(id, entity, data) VALUES($1,$2,$3::jsonb)",
          [newId, entity, JSON.stringify(data)]
        );
        return json(res, 200, { id: newId, ...data });
      });
      return;
    }

    if (req.method === "PUT") {
      if (!id) return json(res, 400, { error: "Missing id" });
      let body = "";
      req.on("data", chunk => (body += chunk));
      req.on("end", async () => {
        const patch = body ? JSON.parse(body) : {};
        const existing = await p.query(
          "SELECT data FROM entity_items WHERE entity=$1 AND id=$2 LIMIT 1",
          [entity, id]
        );
        if (existing.rowCount === 0) return json(res, 404, { error: "Not found" });
        const merged = { ...(existing.rows[0].data || {}), ...(patch || {}) };
        await p.query(
          "UPDATE entity_items SET data=$3::jsonb, updated_at=now() WHERE entity=$1 AND id=$2",
          [entity, id, JSON.stringify(merged)]
        );
        return json(res, 200, { id, ...merged });
      });
      return;
    }

    if (req.method === "DELETE") {
      if (!id) return json(res, 400, { error: "Missing id" });
      await p.query("DELETE FROM entity_items WHERE entity=$1 AND id=$2", [entity, id]);
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (e) {
    return json(res, 500, { error: String(e?.message || e) });
  }
}
