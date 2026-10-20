import React, { useState, useEffect, memo } from 'react';
import DOMPurify from 'dompurify';

interface WikiContentProps {
  category: 'health' | 'wealth' | 'career' | 'romance' | 'fengshui' | 'foundation' | 'dayun' | 'classics';
}

// [AI MOD] XSS 防護 — 允許的標籤白名單（與 parseMarkdown 產出的標籤集合對齊）
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'p', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'li', 'ul', 'ol', 'strong', 'em', 'br', 'a', 'span', 'div', 'code', 'pre', 'blockquote',
];

// [AI MOD] HTML 消毒函數 — 改用 battle-tested 的 DOMPurify，取代易被繞過的手寫 regex。
// 舊手寫淨化器有以下已知繞過向量：無引號事件屬性（onerror=alert(1)）、
// data:/vbscript: URL、src/xlink:href 未過濾、巢狀大小寫混淆標籤。
// 注意：不使用 USE_PROFILES，因它會隱含允許 img/style 等全域屬性，覆蓋白名單意圖。
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    // 僅允許白名單標籤；不開放 USE_PROFILES 以免 img/style 被隱含允許
    ALLOWED_TAGS,
    // parseMarkdown 產出的標籤帶 Tailwind class；href 需保留但 javascript:/data: 由 DOMPurify 預設封鎖
    ALLOWED_ATTR: ['class', 'href'],
    // 明確禁止 SVG / MathML 命名空間標籤（即使 ALLOWED_TAGS 已排除，作為防禦縱深）
    FORBID_TAGS: ['svg', 'math', 'img', 'style'],
    FORBID_ATTR: ['style', 'src', 'xlink:href'],
  });
}

const categoryToFile: Record<WikiContentProps['category'], string> = {
  health: '05_健康.md',
  wealth: '02_財運.md',
  career: '03_事業.md',
  romance: '04_感情姻緣.md',
  fengshui: '07_軟裝風水.md',
  foundation: '01_基礎理論.md',
  dayun: '08_大運流年.md',
  classics: '09_古籍.md',
};

function parseMarkdown(md: string): string {
  const lines = md.split('\n');
  let html = '';
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty line
    if (!line.trim()) {
      if (inTable) {
        html += '</tbody></table>\n';
        inTable = false;
      }
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      if (inTable) {
        html += '</tbody></table>\n';
        inTable = false;
      }
      html += '<hr class="border-zinc-700 my-4" />\n';
      continue;
    }

    // Table row
    if (line.trim().startsWith('|')) {
      const cells = line.trim().split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      // Check if separator row (e.g., |---|---|)
      if (cells.every(cell => /^[\s-:]+$/.test(cell))) {
        continue;
      }

      if (!inTable) {
        html += '<table class="w-full border-collapse border border-zinc-700 text-sm">\n<thead>\n<tr>\n';
        html += cells
          .map(cell => `<th class="bg-zen-card px-3 py-2 text-left text-zen-sage font-semibold border border-zinc-700">${cell.trim()}</th>`)
          .join('\n');
        html += '</tr>\n</thead>\n<tbody>\n';
        inTable = true;
      } else {
        html += '<tr>\n';
        html += cells
          .map(cell => `<td class="px-3 py-2 border border-zinc-700 text-zinc-300">${cell.trim()}</td>`)
          .join('\n');
        html += '</tr>\n';
      }
      continue;
    }

    // Not in table anymore
    if (inTable) {
      html += '</tbody></table>\n';
      inTable = false;
    }

    // Headers
    if (line.startsWith('# ')) {
      html += `<h1 class="text-xl font-bold text-zen-sage mb-3">${line.slice(2).trim()}</h1>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      html += `<h2 class="text-lg font-bold text-zen-text mt-5 mb-2">${line.slice(3).trim()}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      html += `<h3 class="text-base font-semibold text-zen-text mt-4 mb-1">${line.slice(4).trim()}</h3>\n`;
      continue;
    }

    // Paragraph
    html += `<p class="text-zinc-300 leading-relaxed mb-2">${line.trim()}</p>\n`;
  }

  // Close table if still open
  if (inTable) {
    html += '</tbody></table>\n';
  }

  return html;
}

const WikiContent: React.FC<WikiContentProps> = memo(function WikiContent({ category }) {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMarkdown() {
      setLoading(true);
      setError(null);
      setHtml('');

      const filename = categoryToFile[category];

      try {
        const response = await fetch(`/已整理/${filename}`);

        if (!response.ok) {
          throw new Error(`無法載入檔案: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();

        if (!cancelled) {
          setHtml(sanitizeHtml(parseMarkdown(text)));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '載入失敗');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMarkdown();

    return () => {
      cancelled = true;
    };
  }, [category]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zen-sage"></div>
        <span className="ml-3 text-zinc-400">載入中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
        <p className="text-red-400 font-semibold">載入失敗</p>
        <p className="text-red-300 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div
      className="wiki-content prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

export default WikiContent;
