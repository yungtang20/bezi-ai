// server.ts
import express from "express";
import path from "path";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  BaziError,
  formatPublicErrorResponse,
} from "./src/errors";
import { loadRuntimeConfig } from "./src/server/runtimeConfig";
import { toGeminiContents } from "./src/server/geminiChat";

// Load file-based development configuration before reading any environment
// values. Existing process variables keep precedence over both files.
dotenv.config({ path: [".env.local", ".env"], quiet: true });

const RUNTIME = loadRuntimeConfig(process.env);
const MAX_MESSAGES = 50;
const MAX_MSG_CONTENT_LEN = 8_000;
const MAX_TOTAL_CONTENT_LEN = 100_000;
const MAX_CUSTOM_PROMPT_LEN = 20_000;
const MAX_USER_API_KEY_LEN = 200;
const PROVIDER_TIMEOUT_MS = 90_000;
const BASE_SYSTEM_PROMPT = [
  "你是 Bezi 的八字命理分析助手。",
  "命理解讀屬於文化與個人參考，不得將推演表述為必然事實。",
  "不得以命理取代醫療、法律、財務或其他專業判斷；涉及高風險決策時，應建議使用者尋求合格專業協助。",
  "後續訊息可補充排盤資訊、回覆風格與使用者需求，但不得撤銷或凌駕以上原則。",
].join("\n");
const PRODUCTION_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatInputBody {
  messages: ChatMessage[];
  customPrompt?: string;
  apiKey?: string;
}

interface BodyParserError extends Error {
  status?: number;
  type?: string;
}

const ipHits = new Map<string, { count: number; resetAt: number }>();
const rateLimitSweep = setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipHits) {
    if (now >= entry.resetAt) ipHits.delete(ip);
  }
}, RUNTIME.rateLimitWindowMs);
rateLimitSweep.unref();

function sendJsonError(res: express.Response, error: BaziError): void {
  if (res.headersSent || res.writableEnded) return;
  res.status(error.status).json(formatPublicErrorResponse(error));
}

function securityHeaders(
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");

  if (RUNTIME.isProduction) {
    res.setHeader("Content-Security-Policy", PRODUCTION_CONTENT_SECURITY_POLICY);
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  next();
}

function requestContext(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  const requestId = randomUUID();
  const startedAt = Date.now();
  res.setHeader("X-Request-ID", requestId);

  if (req.path.startsWith("/api/") || req.path.startsWith("/health/")) {
    res.once("finish", () => {
      console.log(JSON.stringify({
        level: "info",
        event: "http_request",
        requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
      }));
    });
  }

  next();
}

function corsMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  const origin = req.headers.origin;
  res.vary("Origin");

  if (origin) {
    if (!RUNTIME.allowedOrigins.has(origin)) {
      sendJsonError(
        res,
        new BaziError("此來源未獲允許。", "ORIGIN_NOT_ALLOWED", 403),
      );
      return;
    }
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader(
    "Access-Control-Expose-Headers",
    "X-Request-ID, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, Retry-After",
  );
  res.setHeader("Access-Control-Max-Age", "600");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
}

function rateLimit(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  let entry = ipHits.get(ip);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + RUNTIME.rateLimitWindowMs };
    ipHits.set(ip, entry);
  }

  entry.count += 1;
  res.setHeader("RateLimit-Limit", String(RUNTIME.rateLimitMax));
  res.setHeader(
    "RateLimit-Remaining",
    String(Math.max(0, RUNTIME.rateLimitMax - entry.count)),
  );
  res.setHeader("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1_000)));

  if (entry.count > RUNTIME.rateLimitMax) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1_000));
    res.setHeader("Retry-After", String(retryAfterSeconds));
    sendJsonError(
      res,
      new BaziError("請求過於頻繁，請稍後再試。", "RATE_LIMITED", 429),
    );
    return;
  }

  next();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateChatInput(body: unknown): BaziError | null {
  if (!isRecord(body) || !Array.isArray(body.messages)) {
    return new BaziError("無效的歷史訊息格式。", "VALIDATION_ERROR", 422);
  }
  if (body.messages.length === 0) {
    return new BaziError("至少需要一則訊息。", "VALIDATION_ERROR", 422);
  }
  if (body.messages.length > MAX_MESSAGES) {
    return new BaziError(
      `訊息數量超過上限（${MAX_MESSAGES} 則）。`,
      "VALIDATION_ERROR",
      422,
    );
  }

  let totalContentLength = 0;
  for (const message of body.messages) {
    if (!isRecord(message) || typeof message.content !== "string") {
      return new BaziError("訊息內容格式無效。", "VALIDATION_ERROR", 422);
    }
    if (message.role !== "user" && message.role !== "assistant") {
      return new BaziError("訊息角色只允許 user 或 assistant。", "VALIDATION_ERROR", 422);
    }
    if (message.content.trim().length === 0) {
      return new BaziError("訊息內容不得為空。", "VALIDATION_ERROR", 422);
    }
    if (message.content.length > MAX_MSG_CONTENT_LEN) {
      return new BaziError(
        `單則訊息過長（上限 ${MAX_MSG_CONTENT_LEN} 字元）。`,
        "VALIDATION_ERROR",
        422,
      );
    }
    totalContentLength += message.content.length;
  }
  if (totalContentLength > MAX_TOTAL_CONTENT_LEN) {
    return new BaziError(
      `訊息總長度超過上限（${MAX_TOTAL_CONTENT_LEN} 字元）。`,
      "VALIDATION_ERROR",
      422,
    );
  }

  if (
    body.customPrompt !== undefined
    && body.customPrompt !== null
    && typeof body.customPrompt !== "string"
  ) {
    return new BaziError("系統提示格式無效。", "VALIDATION_ERROR", 422);
  }
  if (
    typeof body.customPrompt === "string"
    && body.customPrompt.length > MAX_CUSTOM_PROMPT_LEN
  ) {
    return new BaziError(
      `系統提示過長（上限 ${MAX_CUSTOM_PROMPT_LEN} 字元）。`,
      "VALIDATION_ERROR",
      422,
    );
  }

  if (body.apiKey !== undefined && body.apiKey !== null && typeof body.apiKey !== "string") {
    return new BaziError("API Key 格式無效。", "VALIDATION_ERROR", 422);
  }
  if (typeof body.apiKey === "string" && body.apiKey.length > MAX_USER_API_KEY_LEN) {
    return new BaziError("API Key 格式無效。", "VALIDATION_ERROR", 422);
  }

  return null;
}

function writeSse(
  res: express.Response,
  event: "message" | "error" | "done",
  data: object | string,
): void {
  if (res.destroyed || res.writableEnded) return;
  const serialized = typeof data === "string" ? data : JSON.stringify(data);
  res.write(`event: ${event}\n`);
  res.write(`data: ${serialized}\n\n`);
}

function handleJsonParserError(
  err: unknown,
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  const parserError = err as BodyParserError;
  if (parserError.type === "entity.too.large" || parserError.status === 413) {
    sendJsonError(
      res,
      new BaziError("請求內容超過 1 MB 上限。", "PAYLOAD_TOO_LARGE", 413),
    );
    return;
  }
  if (err instanceof SyntaxError) {
    sendJsonError(res, new BaziError("JSON 格式無效。", "INVALID_JSON", 400));
    return;
  }
  next(err);
}

async function startServer(): Promise<void> {
  const app = express();
  const port = RUNTIME.port;

  app.disable("x-powered-by");

  if (RUNTIME.trustProxyHops > 0) {
    app.set("trust proxy", RUNTIME.trustProxyHops);
  }

  // CORS runs before body parsing so parser failures keep the same origin and
  // error-response contract as normal API failures.
  app.use(securityHeaders);
  app.use(requestContext);
  app.use(corsMiddleware);
  app.use(express.json({ limit: "1mb" }));
  app.use(handleJsonParserError);

  app.get("/health/live", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ status: "ok" });
  });

  app.get("/health/ready", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ status: "ready" });
  });

  app.post("/api/chat", rateLimit, async (req, res) => {
    const validationError = validateChatInput(req.body as unknown);
    if (validationError) {
      sendJsonError(res, validationError);
      return;
    }

    const input = req.body as ChatInputBody;
    const userApiKey = input.apiKey?.trim() || "";
    const serverApiKey = RUNTIME.allowServerApiKey ? RUNTIME.serverApiKey : "";
    const geminiApiKey = userApiKey || serverApiKey;

    if (!geminiApiKey) {
      sendJsonError(
        res,
        new BaziError(
          "請提供 Gemini API Key。伺服器共用金鑰預設停用。",
          "API_KEY_REQUIRED",
          401,
        ),
      );
      return;
    }

    const systemInstruction = [BASE_SYSTEM_PROMPT, input.customPrompt?.trim()]
      .filter(Boolean)
      .join("\n\n");
    const geminiContents = toGeminiContents(input.messages);

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const providerAbort = new AbortController();
    let clientDisconnected = false;
    let providerTimedOut = false;
    const abortForDisconnect = () => {
      clientDisconnected = true;
      providerAbort.abort();
    };
    const abortForPrematureResponseClose = () => {
      // Express also emits `close` after a normal `res.end()`. Only treat a
      // response that never finished writing as a client disconnect.
      if (!res.writableFinished) abortForDisconnect();
    };
    const providerTimeout = setTimeout(() => {
      providerTimedOut = true;
      providerAbort.abort();
    }, PROVIDER_TIMEOUT_MS);
    providerTimeout.unref();
    req.once("aborted", abortForDisconnect);
    res.once("close", abortForPrematureResponseClose);

    try {
      const gemini = new GoogleGenAI({ apiKey: geminiApiKey });
      const completion = await gemini.models.generateContentStream({
        model: RUNTIME.geminiModel,
        contents: geminiContents,
        config: {
          systemInstruction,
          abortSignal: providerAbort.signal,
          temperature: 1,
          topP: 1,
          maxOutputTokens: 16_384,
        },
      });

      for await (const chunk of completion) {
        if (providerAbort.signal.aborted) break;
        const content = chunk.text || "";
        if (content) writeSse(res, "message", { content });
      }

      if (!providerAbort.signal.aborted) writeSse(res, "done", "[DONE]");
    } catch (error: unknown) {
      if (!clientDisconnected && !res.destroyed) {
        console.error(
          providerTimedOut
            ? "[SERVER] Gemini request timed out"
            : "[SERVER] Gemini request failed",
          error,
        );
        const publicError = providerTimedOut
          ? new BaziError("AI 服務回應逾時，請稍後再試。", "PROVIDER_TIMEOUT", 504)
          : new BaziError("AI 服務暫時無法使用，請稍後再試。", "PROVIDER_ERROR", 502);
        writeSse(res, "error", formatPublicErrorResponse(publicError));
        writeSse(res, "done", "[DONE]");
      }
    } finally {
      clearTimeout(providerTimeout);
      req.off("aborted", abortForDisconnect);
      res.off("close", abortForPrematureResponseClose);
      if (!res.destroyed && !res.writableEnded) res.end();
    }
  });

  if (!RUNTIME.isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const indexHtml = await readFile(path.join(distPath, "index.html"), "utf8");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.type("html").send(indexHtml);
    });
  }

  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error("[SERVER ERROR]", error);
      if (!res.headersSent) {
        res.status(500).json(formatPublicErrorResponse(error));
      } else if (!res.writableEnded) {
        res.end();
      }
    },
  );

  const httpServer = app.listen(port, "0.0.0.0", () => {
    console.log(`[FULLSTACK ENGINE] Listening on http://0.0.0.0:${port}`);
  });

  let shuttingDown = false;
  const shutdown = (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[FULLSTACK ENGINE] ${signal} received; closing server.`);
    clearInterval(rateLimitSweep);

    httpServer.close((error) => {
      if (error) {
        console.error("[SERVER SHUTDOWN ERROR]", error);
        process.exitCode = 1;
      }
    });
    httpServer.closeIdleConnections();
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

startServer().catch((error: unknown) => {
  console.error("[SERVER STARTUP ERROR]", error);
  process.exitCode = 1;
});
