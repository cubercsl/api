import { OpenAPIRoute, OpenAPIRouteSchema, ParameterType, Path, Query, RouteResponse, Str } from "@cloudflare/itty-router-openapi"
import { getBadge } from "./utils"


const cacheTTL: Record<number, number> = {
  200: 43200,
  404: 60,
}

const responses: Record<number, RouteResponse> = {
  200: {
    description: "OK",
    contentType: "image/svg+xml",
    schema: new Str({ format: 'svg' }),
  },
  404: {
    description: "User not found",
    contentType: "image/svg+xml",
    schema: new Str({ format: 'svg' }),
  }
}

const userParam: ParameterType = {
  description: "Codeforces handle",
  required: true,
  example: "tourist",
}

const styleParam: ParameterType = {
  description: "Shields.io badge style",
  required: false,
  default: "flat",
  example: "for-the-badge",
}

const queryUser = Query(String, userParam)
const pathUser = Path(String, userParam)
const queryStyle = Query(String, styleParam)

class CodeforcesBadge extends OpenAPIRoute {

  protected log(request: Request, env: any, user: string, query: any, cacheStatus: string): void {
    if (env.ENVIRONMENT == "production") {
      env.CUBERCSL_API.writeDataPoint({
        'blobs': [
          'Codeforces',
          request.headers.get('User-Agent'),
          request.headers.get('Referer'),
          request.cf?.country,
          request.cf?.city,
          request.cf?.region,
          query.style,
          cacheStatus
        ],
        'doubles': [
          request.cf?.metroCode,
          request.cf?.longitude,
          request.cf?.latitude
        ],
        'indexes': [
          user
        ]
      })
    }
  }
}

export class CodeforcesBadgeV1 extends CodeforcesBadge {
  static schema: OpenAPIRouteSchema = {
    tags: ["Codeforces"],
    summary: "Codeforces Rating Badge",
    description: "Get Codeforces rating badge",
    deprecated: true,
    parameters: {
      user: queryUser,
      style: queryStyle
    },
    responses: responses
  }

  async handle(request: Request, env: any, ctx: any, data: any): Promise<Response> {
    const { user, ...params } = data.query
    const cache = caches.default
    let response = await cache.match(request)
    const cacheStatus = response ? "HIT" : "MISS"
    if (!response) {
      console.log("Cache Miss")
      response = await getBadge(request, user, params)
      if (response.status in cacheTTL) {
        const cacheControl = `s-maxage=${cacheTTL[response.status]}`
        response.headers.append("Cache-Control", cacheControl)
        ctx.waitUntil(cache.put(request, response.clone()))
      }
    }
    this.log(request, env, user, data.query, cacheStatus)
    return response
  }
}

export class CodeforcesBadgeV2 extends CodeforcesBadge {
  static schema: OpenAPIRouteSchema = {
    tags: ["Codeforces"],
    summary: "Codeforces Rating Badge",
    description: "Get Codeforces rating badge",
    parameters: {
      user: pathUser,
      style: queryStyle
    },
    responses: responses
  }

  async handle(request: Request, env: any, ctx: any, data: any): Promise<Response> {
    const { user } = data.params
    const { ...params } = data.query
    const cache = caches.default
    let response = await cache.match(request)
    const cacheStatus = response ? "HIT" : "MISS"
    if (!response) {
      console.log("Cache Miss")
      response = await getBadge(request, user, params)
      if (response.status in cacheTTL) {
        const cacheControl = `s-maxage=${cacheTTL[response.status]}`
        response.headers.append("Cache-Control", cacheControl)
        ctx.waitUntil(cache.put(request, response.clone()))
      }
    }
    this.log(request, env, user, data.query, cacheStatus)
    return response
  }
}
