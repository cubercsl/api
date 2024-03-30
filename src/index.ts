import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { CodeforcesBadgeV1, CodeforcesBadgeV2 } from "./codeforces";
const router = OpenAPIRouter({
  schema: {
    info: {
      title: "Cubercsl's Useless API",
      version: '1.0',
    },
  },
});

router.get('/api/codeforces', CodeforcesBadgeV1);
router.get('/codeforces/:user', CodeforcesBadgeV2);

// Serve robots.txt
router.original.get('/robots.txt', () => new Response('User-agent: *\nDisallow: /', { headers: { 'Content-Type': 'text/plain' } }));
// Redirect root request to the /docs page
router.original.get('/', (request: Request) => Response.redirect(`${request.url}docs`, 302));
// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default {
  fetch: router.handle,
}
