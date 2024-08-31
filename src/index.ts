import { Router } from "itty-router";
import { CodeforcesBadgeV1, CodeforcesBadgeV2 } from "./codeforces";
import { fromIttyRouter } from "chanfana";

const app = fromIttyRouter(Router(), {
  schema: {
    info: {
      title: "Cubercsl's Useless API",
      version: '1.1',
    },
  },
});

app.get('/api/codeforces', CodeforcesBadgeV1);
app.get('/codeforces/:user', CodeforcesBadgeV2);

// Serve robots.txt
app.original.get('/robots.txt', () => new Response('User-agent: *\nDisallow: /', { headers: { 'Content-Type': 'text/plain' } }));
// Redirect root request to the /docs page
app.original.get('/', (request: Request) => Response.redirect(`${request.url}docs`, 302));
// 404 for everything else
app.all('*', () => new Response('Not Found.', { status: 404 }));

export default app
