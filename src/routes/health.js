import { Router } from "express";
import { pool } from "../db/pool.js";

export const healthRouter = Router();

healthRouter.get("/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      ok: true,
      data: {
        service: "youkt-express-gateway",
        db: "up",
        now: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});
