// Restituisce l'URL di un'immagine alla larghezza richiesta.
//  - Immagini caricate nel sito (/media/...): in fase di build vengono create
//    le versioni ridotte  nome.ext.w400.webp / .w800.webp / .w1600.webp
//    (vedi scripts/ottimizza-immagini.mjs).
//  - Immagini ancora su Wix: si usa il ridimensionamento di Wix.
export const LARGHEZZE = [400, 800, 1600];

const PRODUZIONE = typeof process !== "undefined" && process.env.NODE_ENV === "production";

export function immagine(url, w = 800) {
  if (!url) return "";
  if (url.startsWith("/media/")) {
    if (!PRODUZIONE) return url;
    const larg = LARGHEZZE.find((l) => l >= w) ?? 1600;
    return `${url}.w${larg}.webp`;
  }
  const wix = url.match(/^https:\/\/static\.wixstatic\.com\/media\/([^/]+)$/);
  if (wix) {
    return `${url}/v1/fit/w_${w},h_${w * 2},al_c,q_80/${wix[1]}`;
  }
  return url;
}

export function srcset(url, massimo = 1600) {
  if (!url) return undefined;
  if (url.startsWith("/media/") && !PRODUZIONE) return undefined;
  if (!url.startsWith("/media/") && !url.startsWith("https://static.wixstatic.com/media/")) return undefined;
  return LARGHEZZE.filter((l) => l <= massimo)
    .map((l) => `${immagine(url, l)} ${l}w`)
    .join(", ");
}
