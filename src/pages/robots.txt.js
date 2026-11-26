import { SITO } from "../../sito.config.mjs";

export function GET() {
  return new Response(
    `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /cerca/

Sitemap: ${SITO.url}/sitemap-index.xml
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
