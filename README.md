# Bezi 專業八字命理分析與大運流年推算系統

本專案提供全功能的子平八字排盤、五行格局分析、十年大運與流年推算、合盤配對，以及基於 Agnes AI（OpenAI-compatible API）的 SSE 即時 AI 命理解析服務。

主要儲存庫：https://github.com/yungtang20/bezi-ai

線上網站：[https://bezi-ai-api-yungtang20.onrender.com/](https://bezi-ai-api-yungtang20.onrender.com/)

[![CI Pipeline](https://github.com/yungtang20/bezi-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/yungtang20/bezi-ai/actions/workflows/ci.yml)
[![CodeQL](https://github.com/yungtang20/bezi-ai/actions/workflows/codeql.yml/badge.svg)](https://github.com/yungtang20/bezi-ai/actions/workflows/codeql.yml)

參與開發前請閱讀 [`CONTRIBUTING.md`](CONTRIBUTING.md)；安全問題請依
[`SECURITY.md`](SECURITY.md) 私下回報，勿在公開 issue 張貼憑證或個資。

---

## 🏗️ 技術架構與系統設計 (Technical Architecture)

```
┌────────────────────────────────────────────────────────┐
│                  Client-Side (React 19 + Vite + Tailwind)│
│  ├─ Core Paipan Engine + source-backed domain modules   │
│  ├─ Interactive UI (Dashboard, Synastry, Timeline)      │
│  └─ SSE Chat Client (AIChatPanel.tsx + DOMPurify Sanit) │
└───────────────────────────▲────────────────────────────┘
                            │ SSE Streaming / HTTPS
┌───────────────────────────▼────────────────────────────┐
│                  Server-Side (Express + Node.js 22+)   │
│  ├─ Rate Limiting & Security Sanitization Engine       │
│  └─ /api/chat Proxy (OpenAI SDK → Agnes AI)            │
└────────────────────────────────────────────────────────┘
```

- **前端框架**：React 19 + Vite + Tailwind CSS + Lucide Icons + Motion
- **命理排盤引擎**：`@bezi/core` workspace 封裝 `lunar-javascript`、排盤、格局、大運與流年邏輯
- **規則來源層**：`src/domain/` 封裝藏干、合化與格局權重；來源雜湊、頁面與未決歧義見 [`docs/domain-sources.md`](docs/domain-sources.md)，統一術語見 [`CONTEXT.md`](CONTEXT.md)
- **後端服務**：Express Node Server 處理 SSE 即時串流與限流防護
- **資安與防禦**：
  - 後端嚴格校驗訊息數量、內容長度與系統提示格式
  - XSS 防護：使用 `DOMPurify` 洗淨 AI 渲染內容
  - API 金鑰邊界：Agnes Key 只存在後端環境變數；瀏覽器使用短期 Session Token，不接觸 Provider Key

---

## 🔌 API Reference

### POST `/api/chat`

與 AI 命理專家進行即時 SSE 串流對話。

#### Request Header
```http
Content-Type: application/json
Authorization: Bearer <session-token>
```

#### Request Body
```json
{
  "messages": [
    { "role": "user", "content": "請根據我的八字分析今年事業運勢。" }
  ],
  "customPrompt": "可選的自訂系統提示詞",
  "record_id": "demo-001"
}
```

#### 成功回應 (Server-Sent Events)
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache
Connection: keep-alive

data: {"content":"您好，根據您的命盤..."}

data: [DONE]
```

授權失敗會回傳 `401` JSON；通過授權後，驗證錯誤、Evidence Gate 拒答與
Provider 錯誤均使用安全的 SSE payload，不回傳內部堆疊或 Provider Key。

### Runtime health

- `GET /health/live`：程序存活探針。
- `GET /health/ready`：程序可接收流量的基本就緒探針。

兩個端點均回傳 `Cache-Control: no-store`，不揭露金鑰或部署設定。

---

## 🚀 本地開發與部署指南 (Getting Started)

### 1. 環境準備
- **Node.js**: v22+
- **NPM**: 使用 committed `package-lock.json` 進行確定性安裝

### 2. 安裝相依套件
```bash
npm ci
```

### 3. 設定環境變數
將 `.env.example` 複製為 `.env.local`。Agnes Key 與授權密碼只可存在
本機或部署平台的秘密環境變數，不得放入前端或提交至 Git：
```bash
cp .env.example .env.local
```

編輯 `.env.local`：
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
AGNES_API_KEY=your_agnes_api_key_here
AGNES_BASE_URL=https://apihub.agnes-ai.com/v1
AGNES_MODEL=agnes-3.0-flash
BEZI_AUTH_CLIENT_SECRET=your_server_only_auth_secret
NODE_ENV=development
PORT=3000
```

Production 應明確設定 `ALLOWED_ORIGINS` 與 `BEZI_AUTH_CLIENT_SECRET`。
反向代理部署只有在明確知道 hop 數時才設定 `TRUST_PROXY_HOPS`。單機限流
目前使用記憶體；多實例公開部署應改用共享的限流 adapter。

### 4. 啟動開發伺服器
```bash
npm run dev
```
開發伺服器將於 `http://localhost:3000` 啟動。

### 5. GitHub Pages + Render 部署

GitHub Pages 只部署靜態前端；Express API、Session Token、SQLite Evidence
Bundle 與 Agnes 呼叫由 Render Web Service 提供。Agnes Key 絕不寫入 Pages
建置產物。

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yungtang20/bezi-ai)

1. 在 Render 以本儲存庫根目錄的 `render.yaml` 建立 Blueprint，並在建立
   服務時填入 `AGNES_API_KEY` 與 `BEZI_AUTH_CLIENT_SECRET`。
2. Render 預設服務網址為
   `https://bezi-ai-api-yungtang20.onrender.com`。若實際網址不同，請在
   GitHub 儲存庫的 Settings → Secrets and variables → Actions → Variables
   新增 `API_BASE_URL`，值設為實際的 HTTPS 網址。
3. GitHub Pages workflow 會在 `main` 更新後建置 `/bezi-ai/` 路徑，並將
   前端對談請求指向上述 API。
4. 在 Settings → Pages 將 Source 設為 GitHub Actions；正式網址為
   `https://yungtang20.github.io/bezi-ai/`。

Render 免費 Web Service 閒置後可能休眠，首次 AI 請求可能需要等待服務
喚醒；重啟或重新部署也會重置未掛載磁碟的 SQLite 寫入。目前資料庫只供
靜態 Evidence 查詢；若需寫入，請掛載 Persistent Disk 或改用外部資料庫。

---

## 🧪 測試與品質檢驗 (Testing & Linting)

專案整合 **Vitest** 單元測試、Node API contract 測試、Playwright Chromium E2E 與 TypeScript 靜態型別檢查。

```bash
# 執行 TypeScript 靜態型別與語法檢查
npm run lint

# 執行單元測試套件（排盤、格局、大運流年與十神常數測試）
npm test

# 執行後端 API contract / CORS / 輸入邊界測試
npm run test:api

# 首次執行 E2E 前安裝 Chromium
npx playwright install chromium

# 啟動完整 Express + Vite 並執行核心瀏覽器流程
npm run test:e2e
```

---

## 🔒 資安政策與注意事項 (Security & Best Practices)

1. **禁止硬編碼憑證**：原始碼中嚴禁存放任何真實 API Key 或私鑰。
2. **XSS 防範**：前端渲染來自使用者的對話與 AI 回應時，必須經過 `DOMPurify` 處理。
3. **輸入消毒**：請求到達 LLM 前，伺服器驗證角色、訊息長度、總長度、筆數與請求頻率。
4. **CORS allowlist**：Production 透過 `ALLOWED_ORIGINS` 限制瀏覽器來源。
5. **金鑰最小留存**：Agnes Key 只存在後端 Secret Store；瀏覽器只保存短期 Session Token。
6. **瀏覽器安全標頭**：Production 回應包含 HSTS、X-Frame-Options、nosniff 與 Referrer-Policy。
7. **可探測性**：容器與 Render 均使用 `/health/ready` readiness healthcheck。
