// server.ts
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";
import {
  BaziError,
  formatPublicErrorResponse,
} from "./src/errors";

// Load file-based development configuration before reading any environment
// values. Existing process variables keep precedence over both files.
dotenv.config({ path: [".env.local", ".env"], quiet: true });

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ALLOW_SERVER_API_KEY = process.env.ALLOW_SERVER_API_KEY?.trim().toLowerCase() === "true";
const CONFIGURED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = new Set(
  CONFIGURED_ORIGINS.length > 0
    ? CONFIGURED_ORIGINS
    : IS_PRODUCTION
      ? []
      : ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
);

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
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
}, RATE_LIMIT_WINDOW_MS);
rateLimitSweep.unref();

function sendJsonError(res: express.Response, error: BaziError): void {
  if (res.headersSent || res.writableEnded) return;
  res.status(error.status).json(formatPublicErrorResponse(error));
}

function corsMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  const origin = req.headers.origin;
  res.vary("Origin");

  if (origin) {
    if (!ALLOWED_ORIGINS.has(origin)) {
      sendJsonError(
        res,
        new BaziError("此來源未獲允許。", "ORIGIN_NOT_ALLOWED", 403),
      );
      return;
    }
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    ipHits.set(ip, entry);
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
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

function resolvePort(rawPort: string | undefined): number {
  if (!rawPort) return 3000;
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid PORT value: ${rawPort}`);
  }
  return port;
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
  const port = resolvePort(process.env.PORT);

  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || "0");
  if (Number.isInteger(trustProxyHops) && trustProxyHops > 0) {
    app.set("trust proxy", trustProxyHops);
  }

  // CORS runs before body parsing so parser failures keep the same origin and
  // error-response contract as normal API failures.
  app.use(corsMiddleware);
  app.use(express.json({ limit: "1mb" }));
  app.use(handleJsonParserError);

  app.post("/api/chat", rateLimit, async (req, res) => {
    const validationError = validateChatInput(req.body as unknown);
    if (validationError) {
      sendJsonError(res, validationError);
      return;
    }

    const input = req.body as ChatInputBody;
    const userApiKey = input.apiKey?.trim() || "";
    const serverApiKey = ALLOW_SERVER_API_KEY
      ? process.env.NVIDIA_API_KEY?.trim() || ""
      : "";
    const nvidiaApiKey = userApiKey || serverApiKey;

    if (!nvidiaApiKey) {
      sendJsonError(
        res,
        new BaziError(
          "請提供 NVIDIA API Key。伺服器共用金鑰預設停用。",
          "API_KEY_REQUIRED",
          401,
        ),
      );
      return;
    }

    const openAiMessages: Array<{
      role: "system" | ChatRole;
      content: string;
    }> = [{ role: "system", content: BASE_SYSTEM_PROMPT }];
    if (input.customPrompt?.trim()) {
      openAiMessages.push({ role: "system", content: input.customPrompt });
    }
    openAiMessages.push(...input.messages);

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
      const openai = new OpenAI({
        apiKey: nvidiaApiKey,
        baseURL: "https://integrate.api.nvidia.com/v1",
      });
      const completion = await openai.chat.completions.create(
        {
          model: "z-ai/glm-5.2",
          messages: openAiMessages,
          temperature: 1,
          top_p: 1,
          max_tokens: 16_384,
          seed: 42,
          stream: true,
        },
        { signal: providerAbort.signal },
      );

      for await (const chunk of completion) {
        if (providerAbort.signal.aborted) break;
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) writeSse(res, "message", { content });
      }

      if (!providerAbort.signal.aborted) writeSse(res, "done", "[DONE]");
    } catch (error: unknown) {
      if (!clientDisconnected && !res.destroyed) {
        console.error(
          providerTimedOut
            ? "[SERVER] NVIDIA request timed out"
            : "[SERVER] NVIDIA request failed",
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

  if (!IS_PRODUCTION) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
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
