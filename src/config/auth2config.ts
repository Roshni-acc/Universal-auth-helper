import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export interface ProviderConfig {
  strategy: any;
  options: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    [key: string]: any;
  };
  scope?: string[];
}

// Function to get config (called after dotenv loads)
export function getAuth2Config(): { [key: string]: ProviderConfig } {
  return {
    google: {
      strategy: GoogleStrategy,
      options: {
        clientID: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET",
        callbackURL: "/auth/google/callback",
      },
      scope: ["profile", "email"],
    },
  };
}

// For backwards compatibility
export const Auth2Config = getAuth2Config();
