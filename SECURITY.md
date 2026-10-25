# Security Policy

- `AGNES_API_KEY` 與 `BEZI_AUTH_CLIENT_SECRET` 僅可存在 server-side environment。
- 不可使用 `VITE_` 變數傳遞 server secret；前端只保存短期 Session Token。
- `/api/records` 與 `/api/chat` 必須使用 `Authorization: Bearer <token>`。
- `ENABLE_DEV_AUTH_BYPASS=true` 僅允許 development 本機測試，Production 必須關閉。
- `/api/chat` 只接受 server-side SQLite Evidence Bundle；缺少或無效 `record_id` 時回傳 `needs_data`。
- 前端不得提交任意命盤資料繞過 Evidence Gate；AI 輸出須通過結構驗證與 XSS sanitization。
