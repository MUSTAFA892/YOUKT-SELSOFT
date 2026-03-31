import { isAppError } from "../errors.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    ok: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found"
    }
  });
};

export const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error("DEBUG: Express error caught:", err);

  if (isAppError(err)) {
    return res.status(err.status).json({
      ok: false,
      error: {
        code: "APP_ERROR",
        message: err.message,
        details: err.details
      }
    });
  }

  return res.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: err.message || "Unexpected server error",
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    }
  });
};
