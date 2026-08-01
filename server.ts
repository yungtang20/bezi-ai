// server.ts
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";

// [AI MOD] CORS 中介程式：僅允許相同 origin 或明確允許的來源。
// 預設開放（向後相容），但可透過 ALLOWED_ORIGINS 環境變數限制。
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
function corsMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin)) {
    res.status(403).json({ error: "Origin not allowed" });
    return;
  }
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
}

// Load local environment variables if in local debug
dotenv.config();

// [AI MOD] Rate limiting & input validation 常數
// 每 60 秒 per-IP 最多 30 次 /api/chat 請求；一般聊天不會超，可擋惡意刷量。
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
// 輸入上限（防止用超長內容灌爆 LLM API 額度）
const MAX_MESSAGES = 50;
const MAX_MSG_CONTENT_LEN = 8000;
const MAX_CUSTOM_PROMPT_LEN = 20_000;
const MAX_USER_API_KEY_LEN = 200;

// [AI MOD] 輕量 in-memory rate limiter（per-IP，滑動視窗取樣）
// 單一 server instance 適用；多 instance 部署需改用 Redis-backed 限流。
const ipHits = new Map<string, { count: number; resetAt: number }>();
function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  let entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    ipHits.set(ip, entry);
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.status(429);
    res.write(`data: ${JSON.stringify({ error: "請求過於頻繁，請稍後再試。" })}\n\n`);
    res.end();
    return;
  }
  next();
}

// [AI MOD] 輸入驗證：限制 messages 數量、單則長度、customPrompt/apiKey 長度
function validateChatInput(body: any): string | null {
  const { messages, customPrompt, apiKey } = body || {};
  if (!messages || !Array.isArray(messages)) return "無效的歷史訊息格式。";
  if (messages.length > MAX_MESSAGES) return `訊息數量超過上限（${MAX_MESSAGES} 則）。`;
  for (const m of messages) {
    if (!m || typeof m.content !== "string") return "訊息內容格式無效。";
    if (m.content.length > MAX_MSG_CONTENT_LEN) return `單則訊息過長（上限 ${MAX_MSG_CONTENT_LEN} 字元）。`;
  }
  if (customPrompt !== undefined && customPrompt !== null && typeof customPrompt !== "string") {
    return "系統提示格式無效。";
  }
  if (typeof customPrompt === "string" && customPrompt.length > MAX_CUSTOM_PROMPT_LEN) {
    return `系統提示過長（上限 ${MAX_CUSTOM_PROMPT_LEN} 字元）。`;
  }
  if (apiKey !== undefined && apiKey !== null && typeof apiKey !== "string") {
    return "API Key 格式無效。";
  }
  if (typeof apiKey === "string" && apiKey.length > MAX_USER_API_KEY_LEN) {
    return "API Key 格式無效。";
  }
  return null;
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request body parser（限制 1mb，避免灌爆）
  app.use(express.json({ limit: "1mb" }));

  // [AI MOD] CORS 套用
  app.use(corsMiddleware);

  // Secure Server-side API Route with Streaming (SSE) supporting both LongCat and Gemini
  app.options("/api/chat", corsMiddleware, (req, res) => res.status(204).end());
  app.post("/api/chat", rateLimit, async (req, res) => {
    // Set headers for SSE Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      const { messages, customPrompt, apiKey: userApiKey } = req.body;

      // [AI MOD] 輸入驗證（數量、長度、型別）
      const validationError = validateChatInput(req.body);
      if (validationError) {
        res.write(`data: ${JSON.stringify({ error: validationError })}\n\n`);
        return res.end();
      }

      // [AI MOD] customPrompt 型別淨化：只接受字串，避免物件/陣列被注入。內容不刪改（chat 功能所需）。
      const safeCustomPrompt = typeof customPrompt === "string" ? customPrompt : "";
      const rawUserKey = (userApiKey || "").trim();
      const nvidiaApiKey = rawUserKey || process.env.NVIDIA_API_KEY || "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";

      const openAiMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
      if (safeCustomPrompt) {
        openAiMessages.push({ role: "system", content: safeCustomPrompt });
      }
      for (const m of messages) {
        if (!m || !m.content) continue;
        openAiMessages.push({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content
        });
      }

      if (openAiMessages.length === 0) {
        res.write(`data: ${JSON.stringify({ error: "請先輸入您的問題後再送出。" })}\n\n`);
        return res.end();
      }

      console.log(`[SERVER] Querying NVIDIA OpenAI API with model z-ai/glm-5.2 (Streaming)...`);
      const openai = new OpenAI({
        apiKey: nvidiaApiKey,
        baseURL: 'https://integrate.api.nvidia.com/v1',
      });

      try {
        const completion = await openai.chat.completions.create({
          model: "z-ai/glm-5.2",
          messages: openAiMessages,
          temperature: 1,
          top_p: 1,
          max_tokens: 16384,
          seed: 42,
          stream: true
        });

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
            if (typeof (res as any).flushHeaders === 'function') {
              (res as any).flushHeaders();
            }
          }
        }
      } catch (aiErr: any) {
        console.error("[SERVER] NVIDIA OpenAI request failed:", aiErr);
        res.write(`data: ${JSON.stringify({ error: "AI 服務連線失敗：" + (aiErr?.message || "請稍後再試。") })}\n\n`);
      }

      res.end();
    } catch (err: any) {
      // [AI MOD] 記錄完整錯誤於伺服器端，僅回傳通用訊息給客戶端。
      console.error("[SERVER ERROR]:", err);
      res.write(`data: ${JSON.stringify({ error: "伺服器處理異常，請稍後再試。" })}\n\n`);
      res.end();
    }
  });

  // Vite middleware for development index fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK ENGINE] Server is actively listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
