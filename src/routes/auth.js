import { Router } from "express";
import { verifyPassword, signToken, findOrCreateByProvider } from "../services/auth-service.js";
import { AppError } from "../errors.js";

export const authRouter = Router();

authRouter.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) throw new AppError("email and password required", 400);

    const user = await verifyPassword(email, password);
    if (!user) throw new AppError("Invalid credentials", 401);

    const token = signToken(user);
    res.status(200).json({ ok: true, data: { token, user } });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/auth/provider", async (req, res, next) => {
  try {
    const { auth_provider, auth_provider_id, email, first_name, last_name } = req.body || {};
    const user = await findOrCreateByProvider({ auth_provider, auth_provider_id, email, first_name, last_name });
    const token = signToken(user);
    res.status(200).json({ ok: true, data: { token, user } });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/auth/me", async (req, res) => {
  if (!req.user) return res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
  res.status(200).json({ ok: true, data: { user: req.user } });
});

export default authRouter;
