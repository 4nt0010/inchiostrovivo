import { getCollection, type CollectionEntry } from "astro:content";

export type Articolo = CollectionEntry<"articoli">;
export type Rubrica = CollectionEntry<"rubriche">;

export function slugify(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function articoli() {
  const tutti = await getCollection("articoli");
  return tutti.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function rubriche() {
  const tutte = await getCollection("rubriche");
  return tutte.sort((a, b) => a.data.ordine - b.data.ordine || a.data.nome.localeCompare(b.data.nome, "it"));
}

export async function mappaRubriche() {
  const m = new Map<string, Rubrica>();
  for (const r of await rubriche()) m.set(r.id, r);
  return m;
}

export function autoriDi(lista: Articolo[]) {
  const m = new Map<string, { nome: string; slug: string; articoli: Articolo[] }>();
  for (const a of lista) {
    for (const nome of a.data.autori) {
      const slug = slugify(nome);
      if (!m.has(slug)) m.set(slug, { nome, slug, articoli: [] });
      m.get(slug)!.articoli.push(a);
    }
  }
  return [...m.values()].sort((a, b) => a.nome.localeCompare(b.nome, "it"));
}

export function minutiLettura(a: Articolo) {
  const parole = (a.body ?? "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(parole / 200));
}

export function estratto(a: Articolo, max = 160) {
  if (a.data.descrizione) return a.data.descrizione;
  const testo = (a.body ?? "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_#>\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return testo.length <= max ? testo : testo.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

const fmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" });
export const data = (d: Date) => fmt.format(d);

export function elencoNomi(nomi: string[]) {
  if (nomi.length <= 1) return nomi.join("");
  return nomi.slice(0, -1).join(", ") + " e " + nomi[nomi.length - 1];
}
