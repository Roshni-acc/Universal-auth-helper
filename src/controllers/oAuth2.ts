import { Router } from "express";
import { Auth2Service } from "../services/oauth2";
import { ProviderConfig } from "../config/auth2config";

export function auth2Controller(config: { [key: string]: ProviderConfig }) {
  const router = Router();
  const service = new Auth2Service(config);

  // Dynamically attach configured providers
  Object.keys(config).forEach((provider) => {
    try {
      router.get(`/${provider}`, (req, res, next) => {
        const providerCfg = config[provider];
        const clientID = providerCfg?.options?.clientID;
        if (!clientID || clientID.startsWith("YOUR_") || clientID.includes("CLIENT_ID")) {
          const errMsg = encodeURIComponent(`OAuth provider '${provider}' is not configured with valid API credentials in .env. Please set ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET or click 'Simulate OAuth'.`);
          return res.redirect(`/?oauth=error&provider=${provider}&message=${errMsg}`);
        }
        return service.routes(provider).login(req, res, next);
      });

      router.get(`/${provider}/callback`, service.routes(provider).callback);
    } catch (e) {
      console.warn(`[OAuth2] Provider ${provider} skipped or not configured.`);
    }
  });

  // Mock OAuth Route for instant UI testing in local dev environments
  router.get("/mock", (req, res) => {
    const provider = (req.query.provider as string) || "google";
    const mockUser = {
      _id: "usr_mock_" + Math.random().toString(36).substring(2, 8),
      provider: provider,
      providerId: "10982347109238",
      email: `demo.${provider}@universalauth.dev`,
      name: `Demo ${provider.toUpperCase()} Developer`,
      role: "developer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    };

    if (req.session) {
      (req.session as any).user = mockUser;
    }

    // Direct redirect back to studio UI with query param
    return res.redirect(`/?oauth=success&provider=${provider}&email=${encodeURIComponent(mockUser.email)}&name=${encodeURIComponent(mockUser.name)}`);
  });

  router.get("/success", (req, res) => {
    const user = (req.user as any) || (req.session as any)?.user;
    if (user) {
      return res.redirect(`/?oauth=success&provider=${user.provider || "google"}&email=${encodeURIComponent(user.email || "")}&name=${encodeURIComponent(user.name || "")}`);
    }
    res.redirect("/?oauth=error&message=No+authenticated+user+session+found");
  });

  router.get("/fail", (_req, res) => {
    res.redirect("/?oauth=error&message=OAuth+authentication+failed+or+was+cancelled");
  });

  return router;
}

