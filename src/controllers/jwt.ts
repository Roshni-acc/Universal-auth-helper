import { Response, Request } from "express";
import { JwtService } from "../services/jwt";
import jwt from "jsonwebtoken";

export class JwtController {
  public jwtService: JwtService;

  constructor(jwtService?: JwtService) {
    this.jwtService = jwtService || new JwtService();
  }

  // Backwards compatibility accessor
  public get JwtService(): JwtService {
    return this.jwtService;
  }

  async register(req: Request, res: Response) {
    try {
      const user = await this.jwtService.register(req.body);
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
      const result = await this.jwtService.login(req.body.email, req.body.password);
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
      const userId = (req.user as any)?.id || (req.user as any)?._id;
      if (userId) {
        const user = await this.jwtService.getProfile(userId);
        return res.status(200).json({
          status: true,
          message: "User profile fetched successfully",
          user: user
        });
      }

      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : authHeader?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ status: false, message: "No token provided", error: "No token provided" });
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ status: false, error: "JWT_SECRET is not configured" });
      }

      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      const user = await this.jwtService.getProfile(decoded.id);

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
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : authHeader?.split(" ")[1];

      if (!token) {
        return res.status(400).json({ status: false, message: "No token provided", error: "No token provided" });
      }

      await this.jwtService.logout(token);
      return res.status(200).json({ status: true, message: "Logged out successfully (token blacklisted)" });
    } catch (err: any) {
      return res.status(500).json({ status: false, error: err.message });
    }
  }
}