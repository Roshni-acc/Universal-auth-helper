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

export const Auth2Config: { [key: string]: ProviderConfig } = {
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
