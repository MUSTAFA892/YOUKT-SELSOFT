import { config } from "../config.js";

export const apiKeyAuth = (req, res, next) => {
  if (!config.apiKey) {
    return next();
  }

  const incoming = req.header("x-api-key");
  if (incoming !== config.apiKey) {
    return res.status(401).json({
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Missing or invalid x-api-key"
      }
    });
  }

  return next();
};
