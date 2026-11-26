import { defineConfig } from "astro/config";
import { readFileSync, existsSync } from "node:fs";
import sitemap from "@astrojs/sitemap";
import { SITO } from "./sito.config.mjs";
import remarkVideo from "./src/plugins/remark-video.mjs";
import rehypeImmagini from "./src/plugins/rehype-immagini.mjs";

export default defineConfig({
  site: SITO.url,
  trailingSlash: "always",
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  build: { format: "directory" },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/cerca/"),
      // Data di ultima modifica degli articoli, utile a Google
      serialize(item) {
        const m = item.url.match(/\/articoli\/([^/]+)\/$/);
        const file = m && `src/content/articoli/${m[1]}.md`;
        if (file && existsSync(file)) {
          const testo = readFileSync(file, "utf8");
          const d = testo.match(/^aggiornato:\s*(.+)$/m) || testo.match(/^date:\s*(.+)$/m);
          if (d) item.lastmod = new Date(d[1].replace(/["']/g, "").trim()).toISOString();
        }
        return item;
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkVideo],
    rehypePlugins: [rehypeImmagini],
  },
});
