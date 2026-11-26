// Cloudflare Pages Function: avvia l'accesso con GitHub per il pannello /admin.
// Variabili d'ambiente richieste (Cloudflare → Impostazioni → Variabili):
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_CLIENT_ID) {
    return new Response("Manca la variabile GITHUB_CLIENT_ID nelle impostazioni di Cloudflare.", { status: 500 });
  }
  const url = new URL(request.url);
  const stato = crypto.randomUUID();
  const gh = new URL("https://github.com/login/oauth/authorize");
  gh.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  gh.searchParams.set("redirect_uri", `${url.origin}/api/callback`);
  gh.searchParams.set("scope", "repo,user");
  gh.searchParams.set("state", stato);
  return new Response(null, {
    status: 302,
    headers: {
      Location: gh.toString(),
      "Set-Cookie": `oauth_stato=${stato}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}
