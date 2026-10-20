# Bezi 專業八字命理分析與大運流年推算系統

本專案提供全功能的子平八字排盤、五行格局分析、十年大運與流年推算、合盤配對，以及基於 Agnes AI（OpenAI-compatible API）的 SSE 即時 AI 命理解析服務。

主要儲存庫：https://github.com/yungtang20/bezi-ai

---

## 🏗️ 技術架構與系統設計 (Technical Architecture)

```
┌────────────────────────────────────────────────────────┐
│                  Client-Side (React 18 + Vite + Tailwind)│
│  ├─ Core Paipan Engine (paipan.ts, pattern.ts, dayun.ts)│
│  ├─ Interactive UI (Dashboard, Synastry, Timeline)      │
│  └─ SSE Chat Client (AIChatPanel.tsx + DOMPurify Sanit) │
└───────────────────────────▲────────────────────────────┘
                            │ SSE Streaming / HTTPS
┌───────────────────────────▼────────────────────────────┐
│                  Server-Side (Express + Node.js 20)    │
│  ├─ Rate Limiting & Security Sanitization Engine       │
│  └─ /api/chat Proxy (OpenAI SDK → Agnes AI)             │
└────────────────────────────────────────────────────────┘
```

- **前端框架**：React 18 + Vite + Tailwind CSS + Lucide Icons + Motion
- **命理排盤引擎**：`lunar-javascript` 農曆日曆轉換 + 專門封裝的 `paipan.ts`、`pattern.ts`、`dayun.ts`、`dailyAnalysis.ts`
- **後端服務**：Express Node Server 處理 SSE 即時串流與限流防護
- **資安與防禦**：
  - 後端嚴格校驗訊息數量、內容長度與系統提示格式
  - XSS 防護：使用 `DOMPurify` 洗淨 AI 渲染內容
  - API 金鑰安全：金鑰絕不硬編碼於原始碼中，支援環境變數或使用者安全注入

---

## 🔌 API Reference

### POST `/api/chat`

與 AI 命理專家進行即時 SSE 串流對話。

#### Request Header
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "messages": [
    { "role": "user", "content": "請根據我的八字分析今年事業運勢。" }
  ],
  "customPrompt": "可選的自訂提示詞"
}
```

#### Response (Server-Sent Events)
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache
Connection: keep-alive

data: "您好，根據您的命盤..."
data: "目前的流年走到..."
data: [DONE]
```

---

## 🚀 本地開發與部署指南 (Getting Started)

### 1. 環境準備
- **Node.js**: v18+ (建議 v20 LTS)
- **NPM / Bun**: 最新版本

### 2. 安裝相依套件
```bash
npm install
```

### 3. 設定環境變數
將 `.env.example` 複製為 `.env.local` 並設定 API Key：
```bash
cp .env.example .env.local
```

編輯 `.env.local`：
```env
AGNES_API_KEY=your_new_agnes_api_key_here
AGNES_BASE_URL=https://apihub.agnes-ai.com/v1
AGNES_MODEL=agnes-3.0-flash
BEZI_AUTH_CLIENT_SECRET=your_server_only_auth_secret
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. 啟動開發伺服器
```bash
npm run dev
```
開發伺服器將於 `http://localhost:3000` 啟動。

### 5. 新架構與環境變數

- `packages/core`（`@bezi/core`）：共用的排盤、格局、大運、流年與圖表轉換核心；根目錄 shim 維持既有前端與測試相容性。
- `data/bezi.db`：SQLite server-side Evidence Bundle 資料來源。
- `/api/auth/token`：以 `BEZI_AUTH_CLIENT_SECRET` 發行短期 Session Token。
- `/api/records`：需 Bearer Session Token，回傳可用命盤摘要。
- `/api/chat`：需 Bearer Session Token 與有效 `record_id`，後端再呼叫 Agnes AI 並以 SSE 串流。

`.env.local` 範例：

```env
AGNES_API_KEY=server_only_agnes_key
AGNES_BASE_URL=https://apihub.agnes-ai.com/v1
AGNES_MODEL=agnes-3.0-flash
BEZI_AUTH_CLIENT_SECRET=server_only_auth_secret
BEZI_CHAT_API_KEY=optional_server_only_legacy_key
ENABLE_DEV_AUTH_BYPASS=false
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

請勿使用 `VITE_` 前綴放置 server secret；`ENABLE_DEV_AUTH_BYPASS=true` 只可用於本機 development smoke test。

### 6. GitHub Pages + Render 部署

- Render Blueprint 位於 `render.yaml`，以 Docker 建置並執行 Express、前端靜態檔案與 Agnes AI SSE API。
- 在 Render Web Service 的 Environment 設定 `AGNES_API_KEY` 與 `BEZI_AUTH_CLIENT_SECRET`；兩者均不得提交至 Git。`AGNES_BASE_URL`、`AGNES_MODEL` 與 `NODE_ENV` 已由 Blueprint 提供。
- Render 免費實例重啟或重新部署時，本機 SQLite 變更可能遺失。目前 `data/bezi.db` 僅供靜態 Evidence Bundle 查詢；若未來需要寫入，請掛載 Persistent Disk 或改用外部資料庫。
- GitHub Pages 可部署靜態前端至 `https://yungtang20.github.io/bezi-ai/`。目前聊天 API 使用同源 `/api/*` 路徑，因此完整 Agnes AI 功能請使用 Render Web Service；若要讓 Pages 直接呼叫 Render API，需先加入可設定的 API Base URL。

---

## 🧪 測試與品質檢驗 (Testing & Linting)

專案整合了 **Vitest** 單元測試與 TypeScript 靜態型別檢查。

```bash
# 執行 TypeScript 靜態型別與語法檢查
npm run lint

# 執行單元測試套件（排盤、格局、大運流年與十神常數測試）
npm test

# Playwright 瀏覽器 E2E（使用本機 mock Agnes）
npm run test:e2e
```

修改 `@bezi/core` 後，另執行 `npx tsc -p packages/core/tsconfig.json --noEmit`。

---

## 🔒 資安政策與注意事項 (Security & Best Practices)

1. **禁止硬編碼憑證**：原始碼中嚴禁存放任何真實 API Key 或私鑰。
2. **XSS 防範**：前端渲染來自使用者的對話與 AI 回應時，必須經過 `DOMPurify` 處理。
3. **輸入消毒**：請求到達 LLM 前，伺服器必須驗證請求頻率 (Rate Limit)、訊息長度與筆數上限。
