import { Router } from "express";
import { Auth2Service } from "../services/oauth2";
import { Auth2Config } from "../config/auth2config";

export function auth2Controller(config: Auth2Config) {
  const router = Router();
  const service = new Auth2Service(config);

  // create /auth/google, /auth/github automatically
  Object.keys(config).forEach((provider) => {
    router.get(`/${provider}`, service.routes(provider).login);
    router.get(`/${provider}/callback`, service.routes(provider).callback);
  });

  router.get("/success", (req, res) => res.json({ user: req.user }));
  router.get("/fail", (_req, res) => res.send("OAuth login failed"));

  return router;
}
