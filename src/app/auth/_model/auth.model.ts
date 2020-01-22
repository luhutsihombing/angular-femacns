// API_AUTH_POST_LOGIN

export interface Auth {
  accessType: string;
  currentTime: number;
  refreshToken: string;
  shortUsername: string;
  timeToLive: number;
  token: string;
  username: string;
  validUntil: number;
}

export interface Login {
  username: string;
  password: string;
}

export interface Logout {
  nextURL: string;
}
