import { Router } from "express";
import { executeAction } from "../services/data-gateway.js";

export const dataRouter = Router();

dataRouter.post("/data", async (req, res, next) => {
  try {
    const { table, action, payload } = req.body || {};
    const result = await executeAction({ table, action, payload });

    res.status(200).json({
      ok: true,
      data: result,
      meta: {
        requestId: req.id || null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});
