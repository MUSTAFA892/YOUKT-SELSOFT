import crypto from "node:crypto";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { loadSchemaCache } from "./db/schema-cache.js";
import { apiKeyAuth } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { healthRouter } from "./routes/health.js";
import { dataRouter } from "./routes/data.js";
import { metaRouter } from "./routes/meta.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  next();
});

app.use(apiKeyAuth);

app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    data: {
      service: "youkt-express-gateway",
      version: "1.0.0",
      docs: "/README.md"
    }
  });
});

app.use("/api/v1", healthRouter);
app.use("/api/v1", dataRouter);
app.use("/api/v1", metaRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const start = async () => {
  await loadSchemaCache(config.db.schema);
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Gateway listening on port ${config.port}`);
  });
};

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
