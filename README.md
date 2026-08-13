<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Bezi 專業八字命理分析與大運流年推算系統

本專案提供全功能的子平八字排盤、五行格局分析、十年大運與流年推算、合盤配對，以及基於 NVIDIA OpenAI GLM-5.2 的 SSE 即時 AI 命理解析服務。

主要儲存庫：https://github.com/yungtang20/bezi-ai

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
│  └─ /api/chat Proxy (OpenAI SDK → NVIDIA GLM-5.2)      │
└────────────────────────────────────────────────────────┘
```

- **前端框架**：React 19 + Vite + Tailwind CSS + Lucide Icons + Motion
- **命理排盤引擎**：`lunar-javascript` 農曆日曆轉換 + `paipan.ts`、`pattern.ts`、`dayun.ts`、`dailyAnalysis.ts`
- **規則來源層**：`src/domain/` 封裝藏干、合化與格局權重；來源雜湊、頁面與未決歧義見 [`docs/domain-sources.md`](docs/domain-sources.md)，統一術語見 [`CONTEXT.md`](CONTEXT.md)
- **後端服務**：Express Node Server 處理 SSE 即時串流與限流防護
- **資安與防禦**：
  - 後端嚴格校驗訊息數量、內容長度與系統提示格式
  - XSS 防護：使用 `DOMPurify` 洗淨 AI 渲染內容
  - API 金鑰邊界：金鑰絕不硬編碼於原始碼中，支援明確啟用的伺服器環境變數或使用者 BYOK

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
  "customPrompt": "可選的自訂系統提示詞",
  "apiKey": "可選的使用者專屬 NVIDIA API Key"
}
```

#### 成功回應 (Server-Sent Events)
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache
Connection: keep-alive

event: message
data: {"content":"您好，根據您的命盤..."}

event: done
data: [DONE]
```

請求尚未開始串流前的錯誤使用 JSON 與實際 HTTP 狀態，例如：

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json; charset=utf-8

{"error":"訊息角色只允許 user 或 assistant。","code":"VALIDATION_ERROR","timestamp":1786550400000}
```

若 provider 在串流開始後失敗，伺服器會送出 `event: error`，再以
`event: done` / `[DONE]` 結束串流。內部 SDK 錯誤不會回傳給瀏覽器。

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
將 `.env.example` 複製為 `.env.local`。預設採 BYOK，由瀏覽器隨請求提供
NVIDIA API Key；若要啟用伺服器共用金鑰，必須明確設為允許：
```bash
cp .env.example .env.local
```

編輯 `.env.local`：
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
NVIDIA_API_KEY=your_nvidia_api_key_here
ALLOW_SERVER_API_KEY=true
PORT=3000
```

`ALLOW_SERVER_API_KEY` 預設為 `false`。Production 若未設定
`ALLOWED_ORIGINS`，所有帶 `Origin` 的瀏覽器請求會 fail closed；不會反射
任意來源。反向代理部署只有在明確知道 hop 數時才設定
`TRUST_PROXY_HOPS`。

### 4. 啟動開發伺服器
```bash
npm run dev
```
開發伺服器將於 `http://localhost:3000` 啟動。

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
4. **CORS fail closed**：Production 只接受 `ALLOWED_ORIGINS` 明列的瀏覽器來源。
5. **共用金鑰明確啟用**：伺服器環境金鑰只有在 `ALLOW_SERVER_API_KEY=true` 時使用；BYOK 維持可用。
6. **瀏覽器安全標頭**：Production 回應包含 CSP、HSTS、frame-ancestors/X-Frame-Options、nosniff、Referrer-Policy 與 Permissions-Policy。
