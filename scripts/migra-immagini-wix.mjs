// Copia nel repository le immagini che gli articoli caricano ancora da Wix
// e aggiorna i link. Si può eseguire più volte: se non trova link a Wix non fa nulla.
// Lo esegue in automatico GitHub (vedi .github/workflows/immagini-wix.yml).
import { readdir, readFile, writeFile, mkdir, access } from "node:fs/promises";
import { join } from "node:path";

const CONTENUTI = ["src/content/articoli", "src/content/pagine"];
const DEST = "public/media/wix";
const RE = /https:\/\/static\.wixstatic\.com\/media\/([A-Za-z0-9_~.-]+?\.(?:jpe?g|png|gif|webp))/g;
const ESTENSIONE = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" };

await mkdir(DEST, { recursive: true });
const fatti = new Map();
let modificati = 0;

async function esiste(p) {
  try { await access(p); return true; } catch { return false; }
}

async function scarica(id) {
  if (fatti.has(id)) return fatti.get(id);
  const base = id.replace(/~mv2/, "").replace(/\.[a-z]+$/i, "");
  for (const ext of ["jpg", "png", "gif", "webp"]) {
    if (await esiste(join(DEST, `${base}.${ext}`))) {
      fatti.set(id, `/media/wix/${base}.${ext}`);
      return fatti.get(id);
    }
  }
  // Limite a 2000 px: gli originali di Wix possono arrivare a 6000 px
  const gif = /\.gif$/i.test(id);
  const url = gif
    ? `https://static.wixstatic.com/media/${id}`
    : `https://static.wixstatic.com/media/${id}/v1/fit/w_2000,h_2000,al_c,q_90/${id}`;
  const r = await fetch(url, { headers: { Accept: "image/jpeg,image/png,image/gif;q=0.9,*/*;q=0.5" } });
  if (!r.ok) throw new Error(`${r.status} per ${url}`);
  const tipo = (r.headers.get("content-type") || "").split(";")[0];
  const ext = ESTENSIONE[tipo] || id.split(".").pop().toLowerCase();
  const nome = `${base}.${ext}`;
  await writeFile(join(DEST, nome), Buffer.from(await r.arrayBuffer()));
  fatti.set(id, `/media/wix/${nome}`);
  return fatti.get(id);
}

for (const cartella of CONTENUTI) {
  let nomi = [];
  try { nomi = await readdir(cartella); } catch { continue; }
  for (const nome of nomi.filter((n) => n.endsWith(".md"))) {
    const p = join(cartella, nome);
    let testo = await readFile(p, "utf8");
    const ids = [...new Set([...testo.matchAll(RE)].map((m) => m[1]))];
    if (!ids.length) continue;
    for (const id of ids) {
      try {
        const locale = await scarica(id);
        testo = testo.split(`https://static.wixstatic.com/media/${id}`).join(locale);
      } catch (e) {
        console.warn(`Non scaricata: ${id} (${e.message})`);
      }
    }
    await writeFile(p, testo);
    modificati++;
    console.log(`Aggiornato ${p}`);
  }
}
console.log(`Immagini copiate: ${fatti.size}. File aggiornati: ${modificati}.`);
