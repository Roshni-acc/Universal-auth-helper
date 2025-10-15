import express from "express";
import passport from "passport";
import { Auth2Service } from "../../services/outhRoutes";
import { Auth2Config } from "../config/auth2config";

const router = express.Router();

const authService = new Auth2Service(Auth2Config);

// ✅ Dynamically create routes for all configured providers
Object.keys(Auth2Config).forEach((provider) => {
  const { login, callback } = authService.routes(provider);

  router.get(`/auth/${provider}`, login);
  router.get(`/auth/${provider}/callback`, callback);
});

// ✅ Success & Failure Routes
router.get("/auth/success", (req, res) => res.send("Login successful!"));
router.get("/auth/fail", (req, res) => res.send("Login failed!"));

export default router;
