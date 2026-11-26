import rss from "@astrojs/rss";
import { SITO } from "../../sito.config.mjs";
import { articoli, estratto } from "../lib/contenuti";

export async function GET(context) {
  const tutti = await articoli();
  return rss({
    title: SITO.nome,
    description: SITO.descrizione,
    site: context.site,
    customData: "<language>it-it</language>",
    items: tutti.slice(0, 30).map((a) => ({
      title: a.data.title,
      pubDate: a.data.date,
      description: estratto(a, 300),
      link: `/articoli/${a.id}/`,
      author: a.data.autori.join(", "),
    })),
  });
}
