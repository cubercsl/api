import { OpenAPIRoute, OpenAPIRouteSchema, ParameterType, ResponseConfig, Str } from "chanfana"
import { getBadge } from "./utils"
import { z } from 'zod'

const cacheTtlByStatus: Record<number, number> = {
  200: 43200,
  404: 180
}

const responses: Record<string, ResponseConfig> = {
  200: {
    description: "OK",
    content: {
      'image/svg+xml': {
        schema: {
          type: "string",
          format: "binary",
          description: "SVG badge"
        }
      }
    }
  },
  404: {
    description: "Not Found",
    content: {
      'image/svg+xml': {
        schema: {
          type: "string",
          format: "binary",
          description: "SVG badge"
        }
      }
    }
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

class CodeforcesBadge extends OpenAPIRoute {

  private log(
    request: Request,
    env: any,
    params: {
      user: string,
      query: any,
      cacheStatus: string,
      statusCode: number
    }
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
          params.query.style,
          params.cacheStatus,
          params.statusCode
        ],
        'doubles': [
          request.cf?.metroCode,
          request.cf?.longitude,
          request.cf?.latitude
        ],
        'indexes': [
          params.user
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
    this.log(request, env, {
      user: user, 
      query: data.query,
      cacheStatus: cacheStatus,
      statusCode: response.status
    })
    return response
  }
}

export class CodeforcesBadgeV1 extends CodeforcesBadge {
  schema: OpenAPIRouteSchema = {
    tags: ["Codeforces"],
    summary: "Codeforces Rating Badge",
    description: "Get Codeforces rating badge",
    deprecated: true,
    request: {
      query: z.object({
        user: Str(userParam),
        style: Str(styleParam)
      })
    },
    responses: responses
  }

  async handle(request: Request, env: any, ctx: any): Promise<Response> {
    const data = await this.getValidatedData<typeof this.schema>()
    // @ts-ignore
    const { user, ...params } = data.query
    return this.getBadge(request, env, ctx, data, user, params)
  }
}

export class CodeforcesBadgeV2 extends CodeforcesBadge {
  schema: OpenAPIRouteSchema = {
    tags: ["Codeforces"],
    summary: "Codeforces Rating Badge",
    description: "Get Codeforces rating badge",
    request: {
      params: z.object({
        user: Str(userParam),
      }),
      query: z.object({
        style: Str(styleParam)
      })
    },
    responses: responses
  }

  async handle(request: Request, env: any, ctx: any): Promise<Response> {
    const data = await this.getValidatedData<typeof this.schema>()
    // @ts-ignore
    const { user } = data.params
    // @ts-ignore
    const { ...params } = data.query 
    return this.getBadge(request, env, ctx, data, user, params)
  }
}
