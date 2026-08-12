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
│                  Client-Side (React 18 + Vite + Tailwind)│
│  ├─ Core Paipan Engine (paipan.ts, pattern.ts, dayun.ts)│
│  ├─ Interactive UI (Dashboard, Synastry, Timeline)      │
│  └─ SSE Chat Client (AIChatPanel.tsx + DOMPurify Sanit) │
└───────────────────────────▲────────────────────────────┘
                            │ SSE Streaming / HTTPS
┌───────────────────────────▼────────────────────────────┐
│                  Server-Side (Express + Node.js 20)    │
│  ├─ Rate Limiting & Security Sanitization Engine       │
│  └─ /api/chat Proxy (OpenAI SDK → NVIDIA GLM-5.2)      │
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
  "customPrompt": "可選的自訂系統提示詞",
  "apiKey": "可選的使用者專屬 NVIDIA API Key"
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
NVIDIA_API_KEY=your_nvidia_api_key_here
```

### 4. 啟動開發伺服器
```bash
npm run dev
```
開發伺服器將於 `http://localhost:3000` 啟動。

---

## 🧪 測試與品質檢驗 (Testing & Linting)

專案整合了 **Vitest** 單元測試與 TypeScript 靜態型別檢查。

```bash
# 執行 TypeScript 靜態型別與語法檢查
npm run lint

# 執行單元測試套件（排盤、格局、大運流年與十神常數測試）
npm test
```

---

## 🔒 資安政策與注意事項 (Security & Best Practices)

1. **禁止硬編碼憑證**：原始碼中嚴禁存放任何真實 API Key 或私鑰。
2. **XSS 防範**：前端渲染來自使用者的對話與 AI 回應時，必須經過 `DOMPurify` 處理。
3. **輸入消毒**：請求到達 LLM 前，伺服器必須驗證請求頻率 (Rate Limit)、訊息長度與筆數上限。
