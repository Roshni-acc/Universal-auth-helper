import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { RequestHandler } from "express";

export interface OAuthConfig {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

export class OAuth2Service {
  constructor(private config: OAuthConfig) {
    this.initialize();
  }

  private initialize() {
    passport.use(
      new GoogleStrategy(
        {
          clientID: this.config.clientID,
          clientSecret: this.config.clientSecret,
          callbackURL: this.config.callbackURL,
        },
        async (accessToken, refreshToken, profile: Profile, done) => {
          // you could save user in Mongo here via your repository
          const user = {
            provider: "google",
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            accessToken,
            refreshToken,
          };
          return done(null, user);
        }
      )
    );

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj: any, done) => done(null, obj));
  }

  /** Return ready-to-use Express middlewares */
  public routes() {
    return {
      login: passport.authenticate("google", {
        scope: ["profile", "email"],
      }) as RequestHandler,
      callback: passport.authenticate("google", {
        failureRedirect: "/auth/fail",
        successRedirect: "/auth/success",
      }) as RequestHandler,
    };
  }
}
