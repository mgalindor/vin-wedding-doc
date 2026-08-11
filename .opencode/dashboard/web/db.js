/**
 * db.js — Loads markdown.db using sql.js (WASM) directly in the browser.
 * No backend required: the .db file is fetched as a static asset.
 */

const SQL_JS_CDN = 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/';

let db = null;

export async function loadDatabase() {
  const sqlPromise = initSqlJs({
    locateFile: file => `${SQL_JS_CDN}${file}`
  });

  const dataPromise = fetch('/markdown.db').then(res => {
    if (!res.ok) throw new Error(`Failed to load markdown.db: ${res.status}`);
    return res.arrayBuffer();
  });

  const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
  db = new SQL.Database(new Uint8Array(buf));
  return db;
}

export function query(sql, params = []) {
  if (!db) throw new Error('Database not loaded');
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function queryOne(sql, params = []) {
  const rows = query(sql, params);
  return rows[0] || null;
}

