<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Bezi 專業八字命理分析與大運流年推算系統

本專案提供全功能的八字排盤、格局分析、大運流年推算、合盤配對以及 AI 命理解析服務。

主要儲存庫：https://github.com/yungtang20/bezi

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   `npm install`
2. Set `NVIDIA_API_KEY` (or custom API Key) in [.env](.env) / [.env.local](.env.local) for AI consultation (uses GLM-5.2 model via NVIDIA API):
   ```bash
   cp .env.example .env.local
   ```
3. Run the application in development mode:
   `npm run dev`
