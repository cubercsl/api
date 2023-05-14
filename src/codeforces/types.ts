interface OK {
  status: "OK";
  result: User[];
}

interface FAILED {
  status: "FAILED";
  comment: string;
}

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

interface getImageOption {
  handle: string;
  rank: string;
  color?: string;
  rating?: number;
}

type UserData = OK | FAILED;

export type { getImageOption, UserData };
