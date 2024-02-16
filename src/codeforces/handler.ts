import { OpenAPIRoute, OpenAPIRouteSchema, ParameterType, Path, Query, RouteResponse, Str } from "@cloudflare/itty-router-openapi"
import { getBadge } from "./utils"


const cacheTtlByStatus: Record<number, number> = {
  200: 43200,
  404: 180
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

  private log(
    request: Request,
    env: any,
    user: string,
    query: any,
    cacheStatus: string
  ): void {
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

  protected async getBadge(
    request: Request,
    env: any,
    ctx: any,
    data: any,
    user: string,
    params: Record<string, any>
  ): Promise<Response> {
    const cache = caches.default
    const cacheKey = new Request(request.url, {
      method: "GET",
      headers: { "Content-Type": "image/svg+xml" }
    })
    let response = await cache.match(cacheKey)
    const cacheStatus = response ? "HIT" : "MISS"
    if (!response) {
      console.log("Cache Miss")
      response = await getBadge(request, user, params)
      if (response.status in cacheTtlByStatus) {
        const cacheControl = `s-maxage=${cacheTtlByStatus[response.status]}`
        response.headers.set("Cache-Control", cacheControl)
        ctx.waitUntil(cache.put(cacheKey, response.clone()))
      } else {
        // delete cache-control header
        response.headers.delete("Cache-Control")
      }
    }
    this.log(request, env, user, data.query, cacheStatus)
    return response
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
    return this.getBadge(request, env, ctx, data, user, params)
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
    return this.getBadge(request, env, ctx, data, user, params)
  }
}
