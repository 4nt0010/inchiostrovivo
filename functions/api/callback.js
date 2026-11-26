// Cloudflare Pages Function: GitHub rimanda qui dopo il login.
// Scambia il codice con un token e lo passa al pannello Decap CMS.
function pagina(stato, contenuto) {
  const msg = `authorization:github:${stato}:${JSON.stringify(contenuto)}`;
  return new Response(
    `<!doctype html><html lang="it"><meta charset="utf-8"><title>Accesso</title><body>
<p>${stato === "success" ? "Accesso riuscito, puoi chiudere questa finestra." : "Accesso non riuscito: " + (contenuto.error || "")}</p>
<script>
(function () {
  function ricevi(e) {
    window.opener.postMessage(${JSON.stringify(msg)}, e.origin);
    window.removeEventListener("message", ricevi, false);
  }
  window.addEventListener("message", ricevi, false);
  window.opener && window.opener.postMessage("authorizing:github", "*");
})();
</script></body></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Set-Cookie": "oauth_stato=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
      },
    },
  );
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const codice = url.searchParams.get("code");
  const stato = url.searchParams.get("state");
  const cookie = (request.headers.get("Cookie") || "").match(/oauth_stato=([^;]+)/);

  if (!codice || !stato || !cookie || cookie[1] !== stato) {
    return pagina("error", { error: "richiesta non valida, riprova dal pannello." });
  }

  const risposta = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "inchiostro-vivo-cms" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: codice,
      redirect_uri: `${url.origin}/api/callback`,
    }),
  });
  const dati = await risposta.json();
  if (!dati.access_token) {
    return pagina("error", { error: dati.error_description || "token non ricevuto." });
  }
  return pagina("success", { token: dati.access_token, provider: "github" });
}
