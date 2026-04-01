import { config } from "../config.js";
import { verifyToken } from "../services/auth-service.js";

export const apiAuth = (req, res, next) => {
  // If API key is configured and provided, allow immediately
  if (config.apiKey) {
    const incoming = req.header("x-api-key");
    if (incoming && incoming === config.apiKey) return next();
  }

  // Otherwise accept Bearer token
  const auth = req.header("authorization");
  if (!auth) return next();
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return next();

  try {
    const payload = verifyToken(m[1]);
    req.user = { id: payload.sub, email: payload.email, role_id: payload.role_id };
  } catch (err) {
    return res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Invalid token" } });
  }

  return next();
};
