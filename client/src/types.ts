export interface SystemStats {
  status: boolean;
  dbConnected: boolean;
  usersCount: number;
  blacklistCount: number;
  npmDownloads?: number;
  environment: string;
  uptimeSeconds: number;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  type: "success" | "error" | "info";
  data?: any;
}

export type MainTab = "sdk" | "metrics";
export type SubTab = "jwt" | "session" | "oauth";
