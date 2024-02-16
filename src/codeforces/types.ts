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
interface UserDataOK {
  status: 'OK';
  result: User[];
}

interface UserDataFail {
  status: 'FAIL';
  comment: string;
}

type UserData = UserDataOK | UserDataFail;

export type { getImageOption, UserData };
