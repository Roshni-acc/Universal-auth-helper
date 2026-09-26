import { Request } from "express";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
  error?: string;
}

export interface JwtServiceOptions {
  jwtSecret?: string;
  expiresIn?: string | number;
}

export interface UniversalAuthOptions {
  mongoUri?: string;
  jwtSecret?: string;
  sessionSecret?: string;
  expiresIn?: string | number;
  enableOAuth?: boolean;
  enableUI?: boolean;
  oauthConfig?: Record<string, any>;
  deploySense?: {
    enabled?: boolean;
    url?: string;
    serviceName?: string;
    environment?: string;
  };
}

declare global {
  namespace Express {
    interface User {
      id?: string;
      _id?: string;
      email?: string;
      name?: string;
      role?: string;
      [key: string]: any;
    }
    interface Request {
      user?: User;
    }
  }
}

