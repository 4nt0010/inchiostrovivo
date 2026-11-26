// Riduce nel repository le foto caricate troppo grandi (per esempio scatti del
// telefono da 4–8 MB). Lo lancia da solo il workflow "Riduci le immagini" ogni
// volta che su main arriva una foto nuova.
//
// - lato lungo massimo 2000 px, rispettando l'orientamento del telefono
// - stesso nome e stesso formato: gli articoli non vanno toccati
// - toglie i metadati (compresa la posizione GPS dello scatto)
// - sovrascrive solo se il file nuovo pesa davvero meno
import { readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const CARTELLA = "public/media";
const LATO_MAX = 2000;
const PESO_MAX = 1.2 * 1024 * 1024; // sotto questo peso e questa misura la foto resta com'è
const ESTENSIONI = /\.(jpe?g|png|webp)$/i;

async function* file(dir) {
  let voci = [];
  try {
    voci = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const v of voci) {
    const p = join(dir, v.name);
    if (v.isDirectory()) yield* file(p);
    else if (ESTENSIONI.test(v.name) && !/\.w\d+\.webp$/.test(v.name)) yield p;
  }
}

const kb = (b) => `${Math.round(b / 1024)} KB`;
let ridotte = 0;
let risparmiati = 0;

for await (const p of file(CARTELLA)) {
  try {
    const peso = (await stat(p)).size;
    const info = await sharp(p).metadata();
    const lato = Math.max(info.width ?? 0, info.height ?? 0);
    if (lato <= LATO_MAX && peso <= PESO_MAX) continue;

    let img = sharp(p, { animated: false })
      .rotate()
      .resize({ width: LATO_MAX, height: LATO_MAX, fit: "inside", withoutEnlargement: true });

    const ext = p.toLowerCase().split(".").pop();
    if (ext === "png") img = img.png({ compressionLevel: 9, effort: 8 });
    else if (ext === "webp") img = img.webp({ quality: 82 });
    else img = img.jpeg({ quality: 82, mozjpeg: true });

    const nuovo = await img.toBuffer();
    if (nuovo.length >= peso) continue;

    await writeFile(p, nuovo);
    ridotte++;
    risparmiati += peso - nuovo.length;
    console.log(`Ridotta ${p}: ${kb(peso)} → ${kb(nuovo.length)}`);
  } catch (e) {
    console.warn(`Saltata ${p}: ${e.message}`);
  }
}

console.log(ridotte ? `Foto ridotte: ${ridotte}, spazio risparmiato: ${kb(risparmiati)}` : "Nessuna foto da ridurre.");
