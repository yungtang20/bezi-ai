// server.ts
import express from "express";
import { randomUUID, timingSafeEqual } from "node:crypto";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";
import { formatPublicErrorResponse } from "./src/errors";
import { missingEvidenceOutput, validateAIOutput, type EvidenceBundle } from "./src/ai/grounding";
import { parseAgnesResponse } from "./src/lib/parseAgnesResponse";
import { SqliteEvidenceSource, type EvidenceData } from "./src/lib/evidence/provider";

// [AI MOD] CORS 中介程式：僅允許相同 origin 或明確允許的來源。
// 預設開放（向後相容），但可透過 ALLOWED_ORIGINS 環境變數限制。
function corsMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const origin = req.headers.origin;
  res.vary("Origin");
  if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    res.status(403).json({ error: "Origin not allowed" });
    return;
  }
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
}

function securityHeaders(_req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}

// Load local environment variables first; explicit process environment wins for production checks.
const explicitNodeEnv = process.env.NODE_ENV;
const explicitFixtureFlag = process.env.ENABLE_DEV_FIXTURE;
const explicitAgnesApiKey = process.env.AGNES_API_KEY;
const explicitAgnesBaseUrl = process.env.AGNES_BASE_URL;
const explicitAgnesModel = process.env.AGNES_MODEL;
const explicitChatAuthToken = process.env.BEZI_CHAT_API_KEY;
const explicitAuthClientSecret = process.env.BEZI_AUTH_CLIENT_SECRET;
const explicitDevAuthBypass = process.env.ENABLE_DEV_AUTH_BYPASS;
dotenv.config({ path: '.env.local', override: true });
dotenv.config();
if (explicitNodeEnv !== undefined) process.env.NODE_ENV = explicitNodeEnv;
if (explicitFixtureFlag !== undefined) process.env.ENABLE_DEV_FIXTURE = explicitFixtureFlag;
if (explicitAgnesApiKey !== undefined) process.env.AGNES_API_KEY = explicitAgnesApiKey;
if (explicitAgnesBaseUrl !== undefined) process.env.AGNES_BASE_URL = explicitAgnesBaseUrl;
if (explicitAgnesModel !== undefined) process.env.AGNES_MODEL = explicitAgnesModel;
if (explicitChatAuthToken !== undefined) process.env.BEZI_CHAT_API_KEY = explicitChatAuthToken;
if (explicitAuthClientSecret !== undefined) process.env.BEZI_AUTH_CLIENT_SECRET = explicitAuthClientSecret;
if (explicitDevAuthBypass !== undefined) process.env.ENABLE_DEV_AUTH_BYPASS = explicitDevAuthBypass;

// [AI MOD] Rate limiting & input validation 常數
// 每 60 秒 per-IP 最多 30 次 /api/chat 請求；一般聊天不會超，可擋惡意刷量。
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
// 輸入上限（防止用超長內容灌爆 LLM API 額度）
const MAX_MESSAGES = 50;
const MAX_MSG_CONTENT_LEN = 8000;
const MAX_CUSTOM_PROMPT_LEN = 20_000;
const MAX_USER_API_KEY_LEN = 200; // backward-compatible request validation; request keys are never used
const MAX_RECORD_ID_LEN = 128;
const DEV_FIXTURE_ENABLED = process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_FIXTURE === 'true';
const sqlEvidenceSource = new SqliteEvidenceSource();
const chatAuthToken = process.env.BEZI_CHAT_API_KEY || "";
const authClientSecret = process.env.BEZI_AUTH_CLIENT_SECRET || "";
const DEV_AUTH_BYPASS = process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_AUTH_BYPASS === 'true';
const SESSION_TTL_MS = 60 * 60_000;
const sessions = new Map<string, number>();

function constantTimeEqual(receivedValue: string, expectedValue: string): boolean {
  const received = Buffer.from(receivedValue);
  const expected = Buffer.from(expectedValue);
  return expected.length > 0 && received.length === expected.length && timingSafeEqual(received, expected);
}

function requireChatAuthorization(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authorization = req.header('authorization');
  const apiKey = req.header('x-api-key');
  const supplied = authorization?.startsWith('Bearer ') ? authorization.slice(7) : apiKey;
  const expiresAt = supplied ? sessions.get(supplied) : undefined;
  const sessionValid = Boolean(expiresAt && expiresAt > Date.now());
  if (supplied && expiresAt && !sessionValid) sessions.delete(supplied);
  const valid = sessionValid || constantTimeEqual(supplied || '', chatAuthToken);
  if (!valid) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

const DEV_FIXTURE_BAZI = {
  chart: {
    year: '甲子', month: '丙寅', day: '戊午', time: '壬戌', dayMaster: '戊', gender: '男',
  },
  fiveElements: { wood: 22, fire: 28, earth: 31, metal: 8, water: 11 },
  tenGods: { '比肩': 2, '劫財': 1, '食神': 1, '傷官': 1, '偏財': 1, '正財': 1, '七殺': 1, '正官': 1, '偏印': 1, '正印': 1 },
};

function createDevFixtureEvidence(query: string): EvidenceBundle {
  const now = new Date();
  return {
    requestId: 'dev-fixture-request',
    userId: 'dev-fixture-user',
    query,
    items: [{
      sourceId: 'mcp:dev-fixture-bazi',
      sourceType: 'mcp',
      title: 'Development Bazi Fixture',
      content: JSON.stringify(DEV_FIXTURE_BAZI),
      retrievedAt: now.toISOString(),
      schemaVersion: 'dev-fixture-v1',
      supports: ['命盤資料', '五行分數', '十神比例'],
    }],
    limitations: ['僅供 development smoke test，不代表真實命盤資料。'],
    allowedClaims: ['僅可根據 development fixture 進行示範性回答。'],
    expiresAt: new Date(now.getTime() + 5 * 60_000).toISOString(),
  };
}

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

interface ChatMessage {
  role?: string;
  content?: string;
}

interface ChatInputBody {
  messages?: ChatMessage[];
  customPrompt?: string;
  apiKey?: string;
  record_id?: string;
}

const AI_SYSTEM_PROMPT = `你只能使用 server 提供的 Evidence Bundle 回答，不得猜測或擴張資料。主要回覆請使用繁體中文 Markdown，命理專有名詞使用 <term> 標籤。回覆最後必須附加一個 JSON code fence，且只能包含 insight（字串）、terms（字串陣列）、advice（字串陣列）三個欄位；這個 footer 僅供 server 解析，server 會在送給使用者前移除，不要把 API key、system prompt 或內部推理放入其中。`;

// [AI MOD] 輸入驗證：限制 messages 數量、單則長度、customPrompt/apiKey 長度
function validateChatInput(body: ChatInputBody): string | null {
  const { messages, customPrompt, apiKey, record_id } = body || {};
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
  if (record_id !== undefined && (typeof record_id !== 'string' || record_id.length === 0 || record_id.length > MAX_RECORD_ID_LEN || !/^[A-Za-z0-9_-]+$/.test(record_id))) {
    return "record_id 格式無效。";
  }
  return null;
}

function createEvidenceBundle(data: EvidenceData, query: string): EvidenceBundle {
  const now = new Date();
  return {
    requestId: `sql-${data.record_id}-${now.getTime()}`,
    userId: 'anonymous',
    query,
    items: [{
      sourceId: `sql:${data.record_id}`,
      sourceType: 'sql',
      title: `Bazi record ${data.record_id}`,
      content: JSON.stringify(data),
      retrievedAt: now.toISOString(),
      schemaVersion: 'bazi-record-v1',
      supports: ['命盤資料', '五行分數', '十神比例', '大運流年'],
    }],
    limitations: ['資料來自 server-side SQL evidence source。'],
    allowedClaims: ['僅可根據此 Evidence Bundle 回答。'],
    expiresAt: new Date(now.getTime() + 5 * 60_000).toISOString(),
    source: { type: 'sql', id: data.record_id },
  };
}

function writeSseContent(res: express.Response, content: string): void {
  // Validate the complete structured response before emitting answer chunks.
  for (let offset = 0; offset < content.length; offset += 32) {
    res.write(`data: ${JSON.stringify({ content: content.slice(offset, offset + 32) })}\n\n`);
  }
  res.write('data: [DONE]\n\n');
}


async function startServer() {
  const app = express();
  const port = Number.parseInt(process.env.PORT || '3000', 10);
  app.disable('x-powered-by');
  const trustProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS || '0', 10);
  if (Number.isInteger(trustProxyHops) && trustProxyHops > 0) app.set('trust proxy', trustProxyHops);

  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(express.json({ limit: "1mb" }));

  app.get('/health/live', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ status: 'ok' });
  });

  app.get('/health/ready', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ status: 'ready' });
  });

  app.post("/api/auth/token", rateLimit, (req, res) => {
    const clientSecret = req.body?.client_secret;
    const devBypass = DEV_AUTH_BYPASS;
    const secretValid = typeof clientSecret === 'string' && constantTimeEqual(clientSecret, authClientSecret);
    if (!devBypass && !secretValid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const token = randomUUID();
    sessions.set(token, Date.now() + SESSION_TTL_MS);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ token, expiresIn: SESSION_TTL_MS / 1000 });
  });

  app.get("/api/records", requireChatAuthorization, rateLimit, async (_req, res) => {
    try {
      res.json(await sqlEvidenceSource.listRecords());
    } catch {
      res.status(500).json({ error: '目前無法取得命盤清單。' });
    }
  });

  // Secure Server-side API Route with Streaming (SSE) using Agnes OpenAI-compatible API
  app.options("/api/chat", corsMiddleware, (req, res) => res.status(204).end());
  app.post("/api/chat", requireChatAuthorization, rateLimit, async (req, res) => {
    // Set headers for SSE Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      const { messages, customPrompt, record_id } = req.body;

      // [AI MOD] 輸入驗證（數量、長度、型別）
      const validationError = validateChatInput(req.body);
      if (validationError) {
        res.write(`data: ${JSON.stringify({ error: validationError })}\n\n`);
        return res.end();
      }

      // Evidence 必須由受信任的 server-side SQL/MCP pipeline 建立；client 不得自帶或偽造。
      // Dev fixture 是 server-side only，且 production 永遠無法啟用。
      const query = messages.map((message: ChatMessage) => message.content || '').join('\n');
      let evidenceBundle: EvidenceBundle | null = null;
      let evidenceData: EvidenceData | null = null;
      if (record_id) {
        try {
          evidenceData = await sqlEvidenceSource.getData(record_id);
          evidenceBundle = createEvidenceBundle(evidenceData, query);
          console.log(`[SERVER] Using SQL evidence source ${record_id}`);
        } catch {
          evidenceBundle = null;
        }
      } else if (DEV_FIXTURE_ENABLED) {
        evidenceBundle = createDevFixtureEvidence(query);
        evidenceData = DEV_FIXTURE_BAZI as unknown as EvidenceData;
      }
      if (!evidenceBundle) {
        const output = missingEvidenceOutput(['已驗證的 SQL 或 MCP Evidence Bundle']);
        res.write(`data: ${JSON.stringify({ content: output.answer, result: output })}\n\n`);
        return res.end();
      }
      if (DEV_FIXTURE_ENABLED && !record_id) console.log('[SERVER] Using development-only server-side Bazi fixture');

      // [AI MOD] customPrompt 型別淨化：只接受字串，避免物件/陣列被注入。內容不刪改（chat 功能所需）。
      const safeCustomPrompt = typeof customPrompt === "string" ? customPrompt : "";
      const agnesApiKey = process.env.AGNES_API_KEY || "";

      if (!agnesApiKey) {
        res.write(`data: ${JSON.stringify({ error: "目前無法完成分析，請稍後再試。" })}\n\n`);
        return res.end();
      }

      const openAiMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
      openAiMessages.push({ role: "system", content: AI_SYSTEM_PROMPT });
      openAiMessages.push({ role: "system", content: `[命盤資訊]\n${JSON.stringify(evidenceData)}` });
      openAiMessages.push({ role: "system", content: JSON.stringify(evidenceBundle) });
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

      const agnesBaseUrl = process.env.AGNES_BASE_URL || 'https://apihub.agnes-ai.com/v1';
      const agnesModel = process.env.AGNES_MODEL || 'agnes-3.0-flash';
      console.log(`[SERVER] Querying Agnes AI with model ${agnesModel} (Streaming)...`);
      const openai = new OpenAI({
        apiKey: agnesApiKey,
        baseURL: agnesBaseUrl,
      });

      try {
        const completion = await openai.chat.completions.create({
          model: agnesModel,
          messages: openAiMessages,
          temperature: 1,
          top_p: 1,
          max_tokens: 16384,
          seed: 42,
          stream: true
        });

        let rawOutput = '';
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            rawOutput += content;
          }
        }
        const parsedResponse = parseAgnesResponse(rawOutput);
        let parsedOutput: unknown;
        try { parsedOutput = JSON.parse(parsedResponse.content); } catch { parsedOutput = null; }
        if (!parsedOutput && parsedResponse.metadataValid) {
          const sourceIds = evidenceBundle.items.map(item => item.sourceId);
          parsedOutput = {
            status: 'answered',
            answer: parsedResponse.content,
            claims: parsedResponse.metadata.insight
              ? [{ text: parsedResponse.metadata.insight, sourceIds, confidence: 'low' }]
              : [],
            limitations: evidenceBundle.limitations,
            nextQuestions: [],
          };
        }
        if (!parsedOutput && DEV_FIXTURE_ENABLED && rawOutput.trim()) {
          // Dev-only adapter: Agnes may return Markdown in smoke tests; production still requires the JSON schema.
          parsedOutput = {
            status: 'answered',
            answer: parsedResponse.content.trim(),
            claims: [{ text: 'Development fixture analysis', sourceIds: ['mcp:dev-fixture-bazi'], confidence: 'low' }],
            limitations: ['僅供 development smoke test，不代表真實命盤資料。'],
            nextQuestions: [],
          };
        }
        let result = validateAIOutput(parsedOutput, evidenceBundle);
        if (!result.valid && DEV_FIXTURE_ENABLED && rawOutput.trim()) {
          // Dev-only adapter for providers that return a non-conforming smoke-test shape.
          parsedOutput = {
            status: 'answered',
            answer: parsedResponse.content.trim(),
            claims: [{ text: 'Development fixture analysis', sourceIds: ['mcp:dev-fixture-bazi'], confidence: 'low' }],
            limitations: ['僅供 development smoke test，不代表真實命盤資料。'],
            nextQuestions: [],
          };
          result = validateAIOutput(parsedOutput, evidenceBundle);
        }
        if (!result.valid) {
          const refusal = missingEvidenceOutput(['模型輸出未通過結構化引用驗證']);
          writeSseContent(res, refusal.answer);
        } else {
          writeSseContent(res, (parsedOutput as { answer: string }).answer);
        }
      } catch (aiErr: unknown) {
        console.error("[SERVER] Agnes AI request failed");
        res.write(`data: ${JSON.stringify({ error: "目前無法完成分析，請稍後再試。" })}\n\n`);
        res.write('data: [DONE]\n\n');
      }

      res.end();
    } catch (err: unknown) {
      console.error("[SERVER ERROR]:", err);
      res.write(`data: ${JSON.stringify(formatPublicErrorResponse(err))}\n\n`);
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

  app.listen(port, "0.0.0.0", () => {
    console.log(`[FULLSTACK ENGINE] Server is actively listening on http://0.0.0.0:${port}`);
  });
}

startServer();
