// src/components/AIChatPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, RotateCcw, AlertTriangle } from 'lucide-react';
import DOMPurify from 'dompurify';
import { BaziDisplay } from '../types';
import { CLIENT_CONFIG } from '../config';
import { readChatHttpError } from '../api/chatError';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIChatPanelProps {
  bazi?: BaziDisplay | null;
  userName?: string;
  apiKey: string;
  onApiKeyChange: (value: string) => void;
}

// 專業且負責任的八字命理師 System Prompt — 含完整倫理規範、多門派分析框架、行動導向
const SYSTEM_PROMPT = `你是一位專業且負責任的八字學術分析師，熟稔子平格局法、調候理氣、五行旺衰等多角度推演。

## 核心倫理紀律（守則第一）
- ❌ 鐵口直斷：禁止說「你某年必定如何」「肯定離婚」「必有大難」等絕對口氣，一切以機率理氣趨勢探討之。
- ❌ 製造恐懼：切忌以鬼神、絕症、血光威脅使用者，禁止推薦購買特定法器。
- ❌ 替代醫療與專業建議：身體有疾請優先尋求正規醫學診治。不給予投資及法律之確切保證。
- ❌ 實證優先：若推演結果與使用者的實際人生不符，以使用者的真實經歷及反饋為準，隨時調整微調。

## 資訊框架
若已提供命主八字檔案，請主動將其納為論命基礎。若呼叫時尚未提供，可禮貌提醒使用者提供。
每次分析盡量融合：
1. 子平格局（如：正財格、食神格，看十神搭配氣候）
2. 旺衰喜忌（日主強弱及調候喜忌五行）
3. 給予日常生活中切實可行、開朗陽光且積極的「五行色彩/軟裝佈置/身心調研」之改進方針。

請用繁體中文作答。語氣溫厚謙和，像一位睿智、溫柔的命理老師與朋友在相談。`;

export default function AIChatPanel({ bazi, userName, apiKey, onApiKeyChange }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const activeControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      activeControllerRef.current?.abort();
      activeControllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const lastBaziSigRef = useRef<string>('');

  // 當 bazi 核心資料真的改動時，才給予友善提示或重設對話
  useEffect(() => {
    const getBaziSignature = (b?: BaziDisplay | null) => {
      if (!b) return 'none';
      return `${b.year || ''}-${b.month || ''}-${b.day || ''}-${b.time || ''}-${b.chart?.gender || ''}-${b.chart?.dayMaster || ''}`;
    };

    const sig = getBaziSignature(bazi);
    if (sig === lastBaziSigRef.current) {
      return; // 相同的八字排盤，不重複洗掉對話
    }
    lastBaziSigRef.current = sig;

    if (bazi) {
      // 自動插入一條 AI 招呼，表示已收到使用者的八字排盤資訊
      const welcome: Message = {
        role: 'assistant',
        content: `您好！我已經順利載入 ${userName || '您'} 的八字命局檔案（日主為 ${bazi.chart?.dayMaster || '？'}，日支為 ${bazi.chart?.day?.zhi || '？'}）。\n\n您可以隨時問我關於您命盤的八字分析，例如：\n💡「我的喜用神是什麼？」\n💡「適合從事什麼產業？」\n💡「感情姻緣與相處上有什麼建議？」`,
        timestamp: Date.now()
      };
      setMessages([welcome]);
    } else {
      setMessages([
        {
          role: 'assistant',
          content: '您好！我是您的專屬 AI 智慧八字理氣師。請輸入您的生辰八字或提出您的問題，我會為您進行多門派學術解析。',
          timestamp: Date.now()
        }
      ]);
    }
  }, [bazi]);

  const resetPrompt = () => {
    setCustomPrompt('');
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmed, timestamp: Date.now() };
    const newMessages = [...messages, userMessage].slice(-CLIENT_CONFIG.DEFAULT_VALUES.MAX_MESSAGES_HISTORY);
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setDebugInfo(null);
    setStatus('連接 AI 服務中...');

    const controller = new AbortController();
    activeControllerRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 90000);
    try {
      // 合併原系統提示與八字的客製化上下文資訊
      let baziContext = '';
      if (bazi && bazi.chart) {
        const c = bazi.chart;
        baziContext = `\n\n=== 命主當前實時八字排盤資訊 ===
姓名: ${userName || '未提供'}
性別: ${c.gender || '未知'}
西元出生: ${bazi.year}年${bazi.month}月${bazi.day}日 ${bazi.time}時
年柱: ${c.year?.gan}${c.year?.zhi} (${c.year?.tenGod || ''})
月柱: ${c.month?.gan}${c.month?.zhi} (${c.month?.tenGod || ''})
日柱: ${c.day?.gan}${c.day?.zhi} (日主天干：${c.dayMaster}，夫妻宮：${c.day?.zhi})
時柱: ${c.hour?.gan}${c.hour?.zhi} (${c.hour?.tenGod || ''})`;
      }

      const activePrompt = SYSTEM_PROMPT + (customPrompt.trim() ? `\n\n【使用者特別要求/微調設定】\n${customPrompt.trim()}` : '') + '\n\n' + baziContext;

      setStatus('分析大腦解析中...');

      const response = await fetch(CLIENT_CONFIG.API.CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          customPrompt: activePrompt,
          apiKey: apiKey.trim() || undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await readChatHttpError(response));
      }
      if (!response.body) {
        throw new Error('AI 服務未回傳串流內容');
      }
      
      setStatus('接受訊號中...');
      
      const assistantMessage: Message = { role: 'assistant', content: '', timestamp: Date.now() };
      setMessages(prev => [...prev, assistantMessage].slice(-CLIENT_CONFIG.DEFAULT_VALUES.MAX_MESSAGES_HISTORY));
      setStatus(null);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let receivedDone = false;

      const processLine = (line: string): boolean => {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith('data:')) return false;
        const dataString = trimmedLine.slice(5).trim();
        if (dataString === '[DONE]') return true;

        let parsed: { content?: unknown; error?: unknown };
        try {
          parsed = JSON.parse(dataString) as { content?: unknown; error?: unknown };
        } catch {
          throw new Error('AI 串流資料格式錯誤');
        }
        if (parsed.error) throw new Error(String(parsed.error));
        if (typeof parsed.content === 'string' && parsed.content) {
          if (!isMounted.current) return false;
          setMessages(prev => {
            if (prev.length === 0) return prev;
            const next = [...prev];
            const last = { ...next[next.length - 1] };
            last.content += parsed.content as string;
            next[next.length - 1] = last;
            return next;
          });
        }
        return false;
      };

      while (!receivedDone) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (processLine(line)) {
            receivedDone = true;
            break;
          }
        }
        if (done) {
          if (buffer.trim()) processLine(buffer);
          break;
        }
      }
      if (receivedDone) {
        await reader.cancel();
      }

    } catch (err: unknown) {
      console.error("[AIChatPanel Error]:", err);
      if (!isMounted.current) return;

      const errName = err instanceof Error ? err.name : '';
      const errMsg = err instanceof Error ? err.message : String(err);
      const isAbort = 
        errName === 'AbortError' || 
        String(errName || '').toLowerCase().includes('abort') ||
        String(errMsg || '').toLowerCase().includes('abort') ||
        String(err || '').toLowerCase().includes('abort');

      if (isAbort) {
        setDebugInfo('對談連線逾時（90 秒）或被中斷。由於近期 AI 命理對談伺服器載載量高，請稍候 3-5 秒後再次點擊送出。');
      } else {
        setDebugInfo(`對談失敗: ${errMsg}`);
      }
      setStatus(null);
    } finally {
      window.clearTimeout(timeoutId);
      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null;
      }
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-zen-surface/10 p-4 border border-zen-border rounded-2xl">
      {/* 🔑 API Key Config */}
      <div className="shrink-0 mb-3 border-b border-white/5 pb-2">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className="flex items-center gap-1 text-[10px] text-zen-muted hover:text-amber-400 transition-colors font-mono uppercase tracking-wider focus:outline-none"
          >
            <span>🔑 {showKeyConfig ? '收起 Gemini 金鑰設定' : '設定自訂 Gemini API 金鑰'}</span>
            <span className="text-[9px] text-amber-500/80">
              {apiKey ? '（已設定）' : '（尚未設定）'}
            </span>
          </button>
        </div>
        
        {showKeyConfig && (
          <div className="mt-1.5 space-y-1.5 p-2 bg-black/40 border border-white/5 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  onApiKeyChange(e.target.value);
                  setIsKeySaved(false);
                }}
                placeholder="輸入您的 Gemini API 金鑰"
                className="flex-1 px-2.5 py-1.5 bg-black/60 border border-white/5 rounded-lg text-zen-text text-[11px] placeholder-zen-muted/40 focus:outline-none focus:border-amber-500/50"
              />
              <button
                onClick={() => {
                  onApiKeyChange(apiKey.trim());
                  setIsKeySaved(true);
                  setTimeout(() => setIsKeySaved(false), 2000);
                }}
                className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 rounded-lg text-[10px] font-medium transition-colors focus:outline-none"
              >
                {isKeySaved ? '已套用' : '套用'}
              </button>
            </div>
            <p className="text-[9px] text-zen-muted/50 leading-normal">
              請使用 Google AI Studio 建立的 Gemini API 金鑰。金鑰只保留在目前分頁的記憶體中，重新整理或關閉分頁後即清除；對談時會送至本站 AI 代理伺服器。只有部署者明確啟用共用金鑰時，留空才能使用伺服器預設服務。
            </p>
          </div>
        )}
      </div>

      {/* 1. 提示詞自預設（上方微調） */}
      <div className="shrink-0 mb-3">
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="custom-prompt-textarea"
            className="text-[10px] text-zen-gold hover:text-amber-400 transition-colors uppercase tracking-wider font-mono cursor-pointer flex items-center gap-1"
          >
            <span>🔧 自訂 AI 諮詢引導（可選）</span>
          </label>
          <button
            onClick={resetPrompt}
            disabled={customPrompt === ''}
            className="flex items-center gap-1 text-[10px] text-zen-muted hover:text-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-sans"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            重設預設
          </button>
        </div>
        <textarea
          id="custom-prompt-textarea"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="您可以在此微調 AI 的個性，例如「請多使用子平法細談」、「請注重感情層面」..."
          disabled={isLoading}
          rows={2}
          className="w-full px-2.5 py-1.5 bg-black/60 border border-white/20 hover:border-amber-500/30 rounded-lg text-zen-text text-[11px] placeholder-zen-muted/60 resize-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all cursor-text"
        />
      </div>

      {/* 2. 歷史問答滾動區 */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 scrollbar-none mb-3"
        role="log"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={'flex gap-2.5 ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Bot className="w-3 text-amber-400 h-3" />
              </div>
            )}
            <div className="max-w-[85%] space-y-1">
              <div
                className={
                  'px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ' +
                  (msg.role === 'user'
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm'
                    : 'bg-black/30 text-zen-text border border-white/5')
                }
              >
                {DOMPurify.sanitize(msg.content)}
              </div>
              <span className="text-[9px] text-zen-muted/30 font-mono text-right block pr-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                <User className="w-3 text-pink-400 h-3" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 3. 輸入欄 */}
      <div className="shrink-0 flex gap-2">
        <input
          aria-label="AI 對談訊息"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? '論命中，請稍候...' : '向命理師提問...(例如: 2026年運勢如何？)...'}
          disabled={isLoading}
          className="flex-1 px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs text-zen-text placeholder-zen-muted focus:outline-none focus:border-amber-500/40"
        />
        <button
          aria-label={isLoading ? 'AI 回覆產生中' : '送出訊息'}
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="px-3 py-2 bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 4. 底部狀態條 */}
      <div className="shrink-0 mt-3 pt-2.5 border-t border-white/5 flex flex-col gap-2">
        {isLoading && status && (
          <div className="flex items-center gap-2 py-1.5 px-2 bg-amber-500/5 rounded-lg border border-amber-500/10">
            <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
            <span className="text-[11px] text-amber-400/80 font-sans">{status}</span>
          </div>
        )}
        {debugInfo && (
          <div className="flex items-start gap-2 py-1.5 px-2 bg-red-900/10 rounded-lg border border-red-500/20">
            <AlertTriangle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
            <span className="text-[11px] text-red-400 leading-relaxed break-all font-sans">{debugInfo}</span>
          </div>
        )}
        {!isLoading && !debugInfo && (
          <div className="flex items-center gap-1.5 px-1 py-0.5">
            <Sparkles className="w-3 h-3 text-pink-500/40" />
            <span className="text-[10px] text-zen-muted/30 font-sans">對話與命盤資料會送至本站 AI 代理；請僅在信任此網站與連線時使用。</span>
          </div>
        )}
        
    </div>
    </div>
  );
}
