# Inchiostro Vivo: messa online

Sito statico (Astro) ospitato gratis su **Cloudflare Pages**, codice su **GitHub**, dominio su **Aruba**.
Chi pubblica usa il pannello su `inchiostrovivotobelive.it/admin` e non tocca mai il codice.

Dentro ci sono già i 54 articoli esportati da Wix, le 18 rubriche e la pagina "Chi siamo".

---

## 1. Due modifiche prima di caricare

**`sito.config.mjs`**: metti il dominio vero in `url` (già impostato: `https://www.inchiostrovivotobelive.it`).

**`public/admin/config.yml`**: in cima compila
- `repo:` → `4nt0010/inchiostrovivo` (già impostato)
- `base_url:`, `site_url:`, `display_url:` → lo stesso dominio

## 2. Caricare su GitHub

1. Crea un repository chiamato `inchiostrovivo` (può essere privato).
2. Crea un token: GitHub → Settings → Developer settings → Fine-grained tokens, solo per `inchiostrovivo`, con **Contents** e **Workflows** in lettura e scrittura. Al `git push` usalo come password.
3. Da Google Cloud Shell:
   ```bash
   unzip inchiostro-vivo.zip && cd inchiostro-vivo
   git init -b main && git add . && git commit -m "Primo caricamento"
   git remote add origin https://github.com/4nt0010/inchiostrovivo.git
   git push -u origin main
   ```
   (In alternativa: "Add file → Upload files" sul sito di GitHub. Attenzione a includere la cartella nascosta `.github`.)
4. Nella scheda **Actions** parte da sola "Sposta le immagini da Wix": copia nel repository tutte le foto ancora su Wix (circa 150) e aggiorna gli articoli. Dura un paio di minuti. **Non chiudere il sito Wix prima che abbia finito.**

## 3. Pubblicare con Cloudflare Pages

1. Cloudflare → Workers & Pages → Crea → Pages → Collega a Git → scegli il repository.
2. Impostazioni di build:
   - Framework: **Astro**
   - Comando: `npm run build`
   - Cartella di output: `dist`
   - Variabile d'ambiente: `NODE_VERSION` = `22`
3. Salva: in un paio di minuti il sito è online su un indirizzo `….pages.dev`. Ogni nuova pubblicazione lo aggiorna da sola.

## 4. Collegare il dominio Aruba

In Cloudflare Pages → il progetto → **Domini personalizzati** → aggiungi `www.inchiostrovivotobelive.it`.
Cloudflare ti dà un valore tipo `inchiostro-vivo.pages.dev`.

Nel pannello Aruba → Gestione DNS del dominio:
- record **CNAME** `www` → `inchiostro-vivo.pages.dev`
- per l'indirizzo senza www, imposta il reindirizzamento web di Aruba da `inchiostrovivotobelive.it` a `https://www.inchiostrovivotobelive.it`

Alternativa più pulita: sposta i DNS del dominio su Cloudflare (gratis) e lascia la registrazione su Aruba. Se usi la posta di Aruba su quel dominio, controlla che i record MX vengano copiati.

## 5. Login del pannello (/admin)

1. GitHub → Settings → Developer settings → **OAuth Apps** → New OAuth App
   - Homepage URL: `https://www.inchiostrovivotobelive.it`
   - Authorization callback URL: `https://www.inchiostrovivotobelive.it/api/callback`
2. Copia **Client ID** e genera un **Client secret**.
3. Cloudflare Pages → il progetto → Impostazioni → Variabili e segreti (Production):
   - `GITHUB_CLIENT_ID` = il Client ID
   - `GITHUB_CLIENT_SECRET` = il secret (tipo "Segreto")
4. Rilancia l'ultimo deploy (Deployments → Riprova). Poi apri `https://www.inchiostrovivotobelive.it/admin` → "Accedi con GitHub".

## 6. Chi pubblica

Ognuno crea un account GitHub gratuito. Tu lo inviti dal repository: Settings → Collaborators → Add people (ruolo **Write**).

Nel pannello gli articoli passano da **Bozza** → **In revisione** → **Pronto**: quando un docente preme "Pubblica", il sito si aggiorna in circa un minuto.
Nota: chiunque abbia il ruolo Write può premere "Pubblica". La revisione è un accordo della redazione, non un blocco tecnico.

Consigli per chi scrive (sono anche nel pannello):
- un link YouTube da solo su una riga diventa un video
- una riga in corsivo subito sotto una foto diventa la didascalia
- più foto una dopo l'altra diventano una galleria
- compilare "Descrizione dell'immagine" e "Sommario" aiuta Google

## 7. Google

1. [Google Search Console](https://search.google.com/search-console) → aggiungi la proprietà del dominio (verifica con un record TXT su Aruba o Cloudflare).
2. Sitemap → invia `https://www.inchiostrovivotobelive.it/sitemap-index.xml`.

Il vecchio sito Wix aveva il tag `noindex`, quindi Google non lo indicizzava: si parte da zero, senza posizionamento da perdere.

---

### Cosa c'è già per la SEO
Titoli e descrizioni per ogni pagina, link canonici, anteprime per i social (Open Graph), dati strutturati (BlogPosting, Breadcrumb, organizzazione, profili autore), sitemap con data di modifica, feed RSS, `robots.txt`, URL puliti senza accenti, immagini ridimensionate in WebP e caricate solo quando servono, pagine statiche velocissime.

### Struttura
- `src/content/articoli/` articoli in Markdown (uno per file)
- `src/content/rubriche/` rubriche
- `src/content/pagine/chi-siamo.md` pagina Chi siamo
- `public/media/` immagini caricate dal pannello
- `src/styles/globale.css` colori e caratteri
- `public/sfondo-home.webp` foto di sfondo della home (la stessa di Wix: probabilmente è un'immagine della libreria di Wix, conviene sostituirla con una foto vostra)
- `functions/api/` login GitHub per il pannello
- `scripts/` ottimizzazione immagini e migrazione da Wix
