// Dopo la build: per ogni immagine in dist/media crea versioni ridotte in WebP
// (nome.ext.w400.webp, .w800.webp, .w1600.webp) usate dal sito con srcset.
// Gli originali nel repository non vengono toccati.
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const CARTELLA = "dist/media";
const LARGHEZZE = [400, 800, 1600];
const ESTENSIONI = /\.(jpe?g|png|webp|gif|avif|tiff?)$/i;

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

let n = 0;
for await (const p of file(CARTELLA)) {
  try {
    const img = sharp(p, { animated: false }).rotate();
    const { width = 1600 } = await img.metadata();
    await Promise.all(
      LARGHEZZE.map((w) =>
        img
          .clone()
          .resize({ width: Math.min(w, width), withoutEnlargement: true })
          .webp({ quality: 78 })
          .toFile(`${p}.w${w}.webp`),
      ),
    );
    n++;
  } catch (e) {
    console.warn(`Immagine non elaborata: ${p} (${e.message})`);
  }
}
console.log(`Immagini ottimizzate: ${n}`);
