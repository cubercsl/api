import { OpenAPIRoute, OpenAPISchema, Query } from "@cloudflare/itty-router-openapi"
import { getImage, getUserData, ratingColors } from "./utils"

export class CodeforcesBadgeHandler extends OpenAPIRoute {
  static schema: OpenAPISchema = {
    tags: ["Codeforces"],
    summary: "Codeforces Rating Badge",
    description: "Get Codeforces rating badge",
    parameters: {
      user: Query(String, {
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
  
  async handle(request: Request, env: any, ctx: any, data: Record<string, any>) {
    const { user, ...params } = data
    console.log(data)
    if (!user) {
      return new Response(await getImage({
        handle: "404",
        rank: "Not Found",
        color: "critical",
        ...params
      }),{
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
      const { handle, rating, rank} = userData.result[0]
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
}
