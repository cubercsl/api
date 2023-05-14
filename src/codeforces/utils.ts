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

const CF_API = "https://codeforces.com/api/user.info";
const SHIELD_API = "https://img.shields.io/badge";

async function getUserData(handle: string): Promise<UserData> {
  const url = new URL(`${CF_API}`)
  url.search = (new URLSearchParams({ handles: handle })).toString()
  return fetch(url, {
    cf: { cacheTtlByStatus: { "200-299": 86400, 404: 1, "500-599": 0 } },
  }).then((res) => res.json())
}

async function getImage({
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
  const url = new URL(`${SHIELD_API}/${escapedHandle}-${ratingStr}-${color}.svg`)
  url.search = new URLSearchParams({
    ...params,
    cacheSeconds: "86400",
    logo: "Codeforces",
  }).toString();
  return fetch(url, {
    cf: { cacheTtlByStatus: { "200-299": 86400, 404: 1, "500-599": 0 } },
  }).then((res) => res.text());
}

export { getImage, getUserData, ratingColors };
