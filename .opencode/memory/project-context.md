# bezi 專案上下文

## 專案身份
- **專案名**：bezi（Bezi 八字命理分析與大運流年推算系統）
- **專案根目錄**：`D:\徐玉蘭\bezi`
- **套件名稱**：`bezi-ai`（`package.json`，type=module）
- **專案類型**：TypeScript full-stack（React/Vite + Express）八字命理 Web 應用

## Agent OS 角色對映

| 角色 | 權限範圍 | 升級條件 |
|------|----------|----------|
| **CEO** | 範圍鎖定、風險承擔 | 領域知識異動（`LLM_WIKI.md`、`src/data/`）、schema/AI 模型配置、API key 處理 |
| **架構師** | 邊界切分 | 前後端界線、domain module 邊界、`src/data` 知識架構分層 |
| **開發者** | 照圖施工 | `src/`、`server.ts`、`src/data/` 實作 |
| **審核者** | 關卡把關 | lint、測試、建置、API 驗證 **全綠才過** |
| **圖書管理員** | 知識留存 | `LLM_WIKI.md`、講義語料、領域規則溯源 |

## 技術架構

### 前端
- React 18 + Vite + Tailwind CSS（client-side only）
- 入口：`index.html` → `src/main.tsx` → `App.tsx`
- 狀態管理：React Context + localStorage（無 Redux/Zustand）
- 型別：`src/types/` 共用定義

### 後端
- Express + SSE proxy（`server.ts`）
- 單一端點：`POST /api/chat` → Agnes AI（OpenAI-compatible）
- 中介層：rate limiting、input sanitization、DOMPurify 於前端
- 環境變數：`AGNES_API_KEY`、`AGNES_BASE_URL`、`AGNES_MODEL`

### Domain Modules（`src/*.ts`）
| 模組 | 責任 | 對外介面 |
|------|------|----------|
| `paipan.ts` | 子平八字排盤 | `getBaZi(birthInfo)` |
| `pattern.ts` | 五行格局分析 | `analyzePattern(bazi)` |
| `dayun.ts` | 十年大運推算 | `calculateDayun(bazi)` |
| `dailyAnalysis.ts` | 流日/流月分析 | `analyzeDaily(bazi, date)` |
| `matchmaking.ts` | 合盤配對 | `matchTwo(baziA, baziB)` |
| `calibration.ts` | 時間校準（真太陽時） | `calibrateTime(location, datetime)` |

### Knowledge Layer（`src/data/`）
分層架構（見 `knowledge-index.md`）：
- `core/` ── 常數、型別、十神、五行基礎
- `charts/` ── 視覺化資料、格局圖表
- `rules/` ── 判斷邏輯、大運流年規則
- `lecture/` ── 講義語料、十神特質

## 關鍵約束（必須遵守）

1. **前後端嚴格分離** ── `src/` 僅 client 代碼；`server.ts` 僅 server 代碼
2. **XSS 防護** ── AI 回應前端渲染**必須**經 `DOMPurify.sanitize()`
3. **API Key 安全** ── **嚴禁**硬編碼；僅支援後端環境變數 `AGNES_API_KEY`
4. **Rate Limiting** ── `/api/chat` 必須校驗：請求頻率、訊息長度、筆數上限
4. **領域知識來源** ── `LLM_WIKI.md` 為 domain rule provenance（唯一權威來源）
5. **非 git repo** ── **本機不得 `git init`**；遠端 repo：`github.com/yungtang20/bezi`

## 驗收關卡（Reviewer 角色）
```bash
npm run lint      # tsc --noEmit（型別檢查）
npm test          # vitest run（36 測試：排盤、格局、大運流年、十神常數）
npm run build     # vite build + esbuild server bundle
npm run test:e2e  # Playwright（設定檔存在：playwright.config.ts）
```

## 記憶體結構（`.opencode/memory/`）
```
.opencode/memory/
├── project-context.md       # 本檔
├── knowledge-index.md       # 知識圖譜索引（src/data ↔ LLM_WIKI）
├── domain-rule-map.md       # 領域規則溯源表（規則 ↔ 代碼 ↔ 講義）
└── decisions/               # ADR / 重大決策記錄
```

## 當前狀態（2026-10-20）
- ✅ lint 通過（tsc --noEmit）
- ✅ 36 測試全過（vitest run）
- ✅ 建置成功（前端 + 後端 bundle）
- ⚠️ chunk 大小警告：`index-DP3VsYMD.js` 567 kB（建議 `manualChunks` 拆分）
- ❌ git 未初始化（受限於 AGENTS.md 規定）
- ❌ CI/CD 未掛載（`.github/workflows/ci.yml` 存在但未觸發）
- ❌ pre-commit hooks 未生效（需 git repo）

## 待辦優先級（依 TODO.md）
1. 🔴 知識圖譜索引完成 ← **進行中**
2. 🔴 領域規則溯源表
3. 🟡 建置 chunk 優化（`manualChunks`）
4. 🟢 API 端點拆分（排盤 / 合盤 / 大運）
5. 🟢 Domain module 介面契約定義
6. 🟢 Playwright E2E 流程補齊

## 升級/遷移路徑
| 項目 | 當前 | 目標 | 誰負責 |
|------|------|------|--------|
| 版控 | 無 | clone from remote / remote push | CEO |
| CI/CD | 檔案存在未跑 | GitHub Actions 自動跑關卡 | Architect |
| 知識索引 | 人工維護 | 自動化同步 + RAG | Librarian |
| API 架構 | 單一 `/api/chat` | 多端點分流 | Architect |
| 記憶體 | 檔案制 | MCP 連接 | Developer |

## 關鍵檔案清單
```
D:\徐玉蘭\bezi\
├── AGENTS.md                 # 專案映射（本檔依據）
├── LLM_WIKI.md               # 領域知識來源（55KB，唯一權威）
├── package.json              # 專案設定
├── tsconfig.json             # TS 設定
├── vite.config.ts            # Vite 設定
├── vitest.config.ts          # 測試設定
├── playwright.config.ts      # E2E 設定
├── server.ts                 # Express + SSE 後端
├── src/
│   ├── main.tsx              # React 入口
│   ├── App.tsx               # 根組件
│   ├── types/                # 共用型別
│   ├── paipan.ts             # 排盤核心
│   ├── pattern.ts            # 格局分析
│   ├── dayun.ts              # 大運推算
│   ├── dailyAnalysis.ts      # 流日分析
│   ├── matchmaking.ts        # 合盤
│   ├── calibration.ts        # 時間校準
│   ├── data/                 # 知識層（4 子目錄）
│   │   ├── core/
│   │   ├── charts/
│   │   ├── rules/
│   │   ├── lecture/
│   │   ├── elementRemedyHelper.ts
│   │   └── index.ts
│   └── components/           # React 組件
└── .github/workflows/ci.yml  # CI 定義
```