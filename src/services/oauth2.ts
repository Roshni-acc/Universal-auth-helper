import passport from "passport";
import { UserRepository } from "../repositories/oAuth2";
import { ProviderConfig } from "../config/auth2config";

export class Auth2Service {
  private userRepo = new UserRepository();
  constructor(private config: { [key: string]: ProviderConfig }) {
    this.initialize();
  }

  private initialize() {
    Object.entries(this.config).forEach(([provider, { strategy, options }]) => {
      passport.use(
        new strategy(
          options,
          this.verifyUser(provider)
        )
      );
    });

    passport.serializeUser((user, done) => done(null, (user as any)._id));
    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await this.userRepo.findById(id);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    });
  }

  private verifyUser(provider: string) {
    return async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        let user = await this.userRepo.findByProvider(provider, profile.id);

        if (!user) {
          user = await this.userRepo.create({
            provider,
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName || profile.username,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    };
  }
  public routes(provider: string) {
    const cfg = this.config[provider];
    if (!cfg) throw new Error(`Provider not configured: ${provider}`);

    return {
      login: passport.authenticate(provider, { scope: cfg.scope || ["profile", "email"] }),
      callback: passport.authenticate(provider, {
        failureRedirect: "/auth/fail",
        successRedirect: "/auth/success",
      }),
    };
  }
}
