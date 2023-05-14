import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { CodeforcesBadgeHandler } from "./codeforces";
const router = OpenAPIRouter({
	schema: {
		info: {
			title: "Cubercsl's Useless API",
			version: '1.0',
		},
	},
});

router.get('/codeforces', CodeforcesBadgeHandler);

// Redirect root request to the /docs page
router.original.get('/', request => Response.redirect(`${request.url}docs`, 302));
// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default {
    fetch: router.handle,
}
