#!/usr/bin/env deno run --allow-net

import { ExtendedRequest, ky, ServerRequest } from "../deps.ts";

const CF_API = "https://codeforces.com/api/user.info";
const SHIELD_API = "https://img.shields.io/badge";

interface OK {
  status: "OK";
  result: User[];
}

interface FAILED {
  status: "FAILED";
  comment: string;
}

type Response = OK | FAILED;

// http://codeforces.com/apiHelp/objects#User
interface User {
  handle: string;
  email?: string;
  vkId?: string;
  openId?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution?: number;
  rank?: string;
  rating?: number;
  maxRank?: string;
  maxRating?: number;
  lastOnlineTimeSeconds?: number;
  registrationTimeSeconds?: number;
  friendOfCount?: number;
  avatar?: string;
  titlePhoto?: string;
}

export interface getImageOption {
  handle: string;
  rank: string;
  color?: string;
  rating?: number;
}

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

export async function getImage({
  handle,
  rank,
  color,
  rating = undefined,
  ...params
}: getImageOption): Promise<string> {
  const toTitleCase = (str: string) =>
    str.replace(/\b\S/g, (t) => t.toUpperCase());
  const escapedHandle = handle.replace("_", "__").replace("-", "--");
  const ratingStr = rating
    ? `${toTitleCase(rank)} ${rating}`
    : `${toTitleCase(rank)}`;
  const svg = await ky
    .get(`${SHIELD_API}/${escapedHandle}-${ratingStr}-${color}.svg`, {
      searchParams: {
        ...params,
        cacheSeconds: 86400,
        logo: "Codeforces",
      },
    }).text();
  return svg;
}

export async function getUserData(handle: string): Promise<Response> {
  const data: Response = await ky
    .get(`${CF_API}`, {
      searchParams: {
        handles: handle,
      },
      throwHttpErrors: false,
    }).json();
  return data;
}

if (import.meta.main) {
  if (!Deno.args[0]) {
    console.log("Please give me a user handle.");
    Deno.exit(1);
  }
  const respose = await getUserData(Deno.args[0]);
  console.log(respose);
}

export default async (req: ServerRequest) => {
  const { search } = new ExtendedRequest(req);
  const { user, ...params } = search;
  if (!user) {
    req.respond({
      status: 404,
      body: await getImage({
        handle: "404",
        rank: "user not found",
        color: "critical",
        ...params,
      }),
      headers: new Headers({
        "content-type": "image/svg+xml",
      }),
    });
    return;
  }
  const respose = await getUserData(user);
  console.debug(respose);
  if (respose.status != "OK") {
    req.respond({
      status: 404,
      body: await getImage({
        handle: "404",
        rank: "user not found",
        color: "critical",
        ...params,
      }),
      headers: new Headers({
        "content-type": "image/svg+xml",
      }),
    });
  } else {
    const { handle, rating, rank } = respose.result[0];
    const color = ratingColors.get(rank ?? "unrated");
    req.respond({
      status: 200,
      body: await getImage({
        handle: handle,
        rating: rating,
        rank: rank ?? "unrated",
        color: color,
        ...params,
      }),
      headers: new Headers({
        "cache-control": "s-maxage=86400",
        "content-type": "image/svg+xml",
      }),
    });
  }
};
