# Contributing

## Workspace

- `packages/core`：`@bezi/core` 命理計算與領域型別。
- `src`：React/Vite 前端與相容 shim。
- `server.ts`：Session Token、SQLite Evidence Bundle 與 Agnes SSE proxy。
- `data/bezi.db`：server-side SQLite evidence 資料庫。

## 驗證流程

```bash
npm install
npm run lint
npm test
npm run test:e2e
npm run build
```

E2E 使用本機 mock Agnes，不需要真實 API Key。真實 Agnes 驗證只能在受控環境執行，Key 必須存於 `.env.local` 或部署平台 secret store。

請勿移除 Evidence Bundle gate、Session Token 授權、SSE `data`／`[DONE]` 格式或 `<term>` Tooltip sanitization。
