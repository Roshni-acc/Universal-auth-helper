import { Response, Request } from "express";
import { JwtService } from "../services/jwt";
import jwt from "jsonwebtoken";

const getJwtSecret = () => process.env.JWT_SECRET || "universal_auth_default_jwt_secret_2026";

export class JwtController {
  public JwtService = new JwtService();

  async register(req: Request, res: Response) {
    try {
      const user = await this.JwtService.register(req.body);
      return res.status(201).json({
        status: true,
        message: "User registered successfully",
        user: user
      });
    } catch (err: any) {
      return res.status(400).json({ status: false, error: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      if (!req.body?.email || !req.body?.password) {
        return res.status(400).json({ status: false, error: "Email and password are required" });
      }
      const result = await this.JwtService.login(req.body.email, req.body.password);
      return res.status(200).json({
        status: true,
        message: "User login successful",
        token: result.token,
        user: result.user
      });
    } catch (err: any) {
      return res.status(401).json({ status: false, error: err.message });
    }
  }

  async profile(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ status: false, message: "No token provided" });
      }
      const decoded = jwt.verify(token, getJwtSecret()) as { id: string };
      const user = await this.JwtService.getProfile(decoded.id);

      return res.status(200).json({
        status: true,
        message: "User profile fetched successfully",
        user: user
      });
    } catch (err: any) {
      return res.status(401).json({ status: false, error: err.message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(400).json({ status: false, message: "No token provided" });

      await this.JwtService.logout(token);
      return res.status(200).json({ status: true, message: "Logged out successfully (token blacklisted)" });
    } catch (err: any) {
      return res.status(500).json({ status: false, error: err.message });
    }
  }
}