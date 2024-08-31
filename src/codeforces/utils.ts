import { getImageOption, UserData } from "./types";

const ratingColors = new Map([
  ["legendary grandmaster", "ff0000"],
  ["international grandmaster", "ff0000"],
  ["grandmaster", "ff0000"],
  ["international master", "ff8c00"],
  ["master", "ff8c00"],
  ["candidate master", "aa00aa"],
  ["expert", "0000ff"],
  ["specialist", "03a89e"],
  ["pupil", "008000"],
  ["newbie", "808080"],
  ["unrated", "000000"],
]);

const CF_API = "https://codeforces-api-proxy.vercel.app/api/user.info";
const SHIELD_API = "https://img.shields.io/badge";

async function fetchWithCache(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const cache = caches.default
  const cacheKey = new Request(input)
  let response = await cache.match(cacheKey)
  if (!response) {
    console.log("User data cache miss")
    response = await fetch(input, init)
    if (response.status === 200) {
      response = new Response(response.body, response)
      response.headers.set("Cache-Control", "s-maxage=43200")
      await cache.put(cacheKey, response.clone())
    }
  }
  return response
}

async function getUserData(request: Request, handle: string): Promise<UserData> {
  const url = new URL(`${CF_API}`)
  url.search = (new URLSearchParams({ handles: handle })).toString()
  return fetchWithCache(url.toString(), {
    headers: request.headers
  }).then(resp => resp.json())
}

async function getImage(
  request: Request, {
    handle,
    rank,
    color,
    rating = undefined,
    ...params
  }: getImageOption
): Promise<Response> {
  const toTitleCase = (str: string) =>
    str.replace(/\b\S/g, t => t.toUpperCase())
  const escapedHandle = handle.replaceAll("_", "__").replaceAll("-", "--")
  const ratingStr = rating
    ? `${toTitleCase(rank)} ${rating}`
    : `${toTitleCase(rank)}`;
  const url = new URL(`${SHIELD_API}/${escapedHandle} -${ratingStr}-${color}.svg`)
  url.search = new URLSearchParams({
    ...params,
    cacheSeconds: "43200",
    logo: "Codeforces",
  }).toString()
  return fetch(url, {
    headers: request.headers
  })
}

export async function getBadge(
  request: Request,
  user: string,
  params: Record<string, any>
): Promise<Response> {
  if (!user) {
    const image = await getImage(request, {
      handle: "404",
      rank: "Not Found",
      color: "critical",
      ...params
    })
    return new Response(image.body, {
      status: 404,
      headers: image.headers
    })
  }
  try {
    const userData = await getUserData(request, user)
    console.log(userData)
    if (userData.status != "OK") {
      const resp = await getImage(request, {
        handle: "404",
        rank: "Not Found",
        color: "critical",
        ...params
      })
      return new Response(resp.body, {
        status: 404,
        headers: resp.headers
      })
    }
    const { handle, rating, rank } = userData.result[0]
    const color = ratingColors.get(rank ?? "unrated") ?? "000000" // for "tourist"
    const resp = await getImage(request, {
      handle: handle,
      rating: rating,
      rank: rank ?? "unrated",
      color: color,
      ...params,
    })
    return new Response(resp.body, {
      status: 200,
      headers: resp.headers
    })
  } catch (error) {
    console.error(error)
    const resp = await getImage(request, {
      handle: "500",
      rank: "Internal Server Error",
      color: "critical",
      ...params,
    })
    return new Response(resp.body, {
      status: 500,
      headers: resp.headers
    })
  }
}

