import { OpenAPIRoute, OpenAPISchema, Path, Query } from "@cloudflare/itty-router-openapi"
import { getImage, getUserData, ratingColors } from "./utils"

async function getBadge(user: string, params: Record<string, any>): Promise<Response> {
  if (!user) {
    return new Response(await getImage({
      handle: "404",
      rank: "Not Found",
      color: "critical",
      ...params
    }), {
      status: 404,
      headers: {
        "content-type": "image/svg+xml"
      }
    })
  }
  try {
    const userData = await getUserData(user)
    console.log(userData)
    if (userData.status != "OK") {
      return new Response(await getImage({
        handle: "404",
        rank: "Not Found",
        color: "critical",
        ...params
      }), {
        status: 404,
        headers: {
          "content-type": "image/svg+xml"
        }
      })
    }
    const { handle, rating, rank } = userData.result[0]
    const color = ratingColors.get(rank ?? "unrated")
    return new Response(await getImage({
      handle: handle,
      rating: rating,
      rank: rank ?? "unrated",
      color: color,
      ...params,
    }), {
      headers: {
        "cache-control": "s-maxage=86400",
        "content-type": "image/svg+xml",
      }
    })
  } catch (error) {
    console.error(error)
    return new Response(await getImage({
      handle: "500",
      rank: "Internal Server Error",
      color: "critical",
      ...params,
    }), {
      status: 500,
      headers: {
        "content-type": "image/svg+xml",
      }
    })
  }
}

class CodeforcesBadge extends OpenAPIRoute {
  async handle(request: Request, env: any, ctx: any, data: Record<string, any>): Promise<Response> {
    const { user, ...params } = data
    return getBadge(user, params)
  }
}
export class CodeforcesBadgeV1 extends CodeforcesBadge {
  static schema: OpenAPISchema = {
    tags: ["Codeforces"],
    summary: "Codeforces Rating Badge",
    description: "Get Codeforces rating badge",
    deprecated: true,
    parameters: {
      user: Query(String, {
        description: "Codeforces handle",
        required: true,
        example: "tourist",
      }),
      style: Query(String, {
        description: "Shields.io badge style",
        required: false,
        default: "flat",
        example: "for-the-badge",
      })
    }
  }
}

export class CodeforcesBadgeV2 extends CodeforcesBadge {
  static schema: OpenAPISchema = {
    tags: ["Codeforces"],
    summary: "Codeforces Rating Badge",
    description: "Get Codeforces rating badge",
    parameters: {
      user: Path(String, {
        description: "Codeforces handle",
        required: true,
        example: "cubercsl",
      }),
      style: Query(String, {
        description: "Shields.io badge style",
        required: false,
        default: "flat",
        example: "flat-square",
      })
    }
  }
}
