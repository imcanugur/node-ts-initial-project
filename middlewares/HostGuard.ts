import { Request, Response, NextFunction } from "express";
import config from "config";
import {normalizePath, respond} from "@/utils/respond";

interface DomainRule {
  domain: string;
  allowedRoutes?: string[];
  deniedRoutes?: string[];
  redirectTo?: string;
}

interface DomainGuardConfig {
  enabled: boolean;
  rules: DomainRule[];
}

export function HostGuard(req: Request, res: Response, next: NextFunction) {
  const guardConfig = config.get<DomainGuardConfig>("app.domain");

  if (!guardConfig?.enabled) return next();

  const host = req.headers.host?.toLowerCase();
  if (!host) {
    console.warn("⚠️ Missing Host header");
    return respond(res, 400, "Missing Host header");
  }

  const matchedDomain = guardConfig.rules.find(rule =>
    host === rule.domain || host.endsWith("." + rule.domain)
  );

  if (!matchedDomain) {
    console.warn(`🚫 Unauthorized domain: ${host}`);
    return respond(res, 403, "Forbidden domain");
  }

  const { allowedRoutes = [], deniedRoutes = [], redirectTo } = matchedDomain;
  const path = normalizePath(req.path);

  const isDenied = deniedRoutes.some(route => matchRoute(route, path));
  if (isDenied) {
    console.warn(`🚫 [${host}] ${path} blocked by deniedRoutes`);
    if (redirectTo) return res.redirect(redirectTo);
    return respond(res, 403, "Access denied for this route");
  }

  const isAllowed = allowedRoutes.some(route => matchRoute(route, path));
  if (!isAllowed) {
    console.warn(`❌ [${host}] tried to access ${path} (not allowed)`);
    return respond(res, 404, "Not Found");
  }

  next();
}

function matchRoute(pattern: string, path: string): boolean {
  if (!pattern) return false;
  if (pattern === "*") return true;
  if (pattern.endsWith("*")) {
    const base = pattern.slice(0, -1);
    return path.startsWith(base);
  }
  return path === pattern;
}
