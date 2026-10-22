import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bot, Loader2, RotateCcw, Send, Sparkles, User } from 'lucide-react';
import { BaziDisplay } from '../types';
import AIMessage from './chat/AIMessage';
import { useSSEChat } from '../hooks/useSSEChat';
import { CLIENT_CONFIG, createCurrentEvidence, fetchChatRecords, requestChatSession, type ChatRecordSummary } from '../config';
import { trackProductEvent } from '../lib/productEvents';

interface AIChatPanelProps { bazi?: BaziDisplay | null; }

const SYSTEM_PROMPT = `你是一位專業且負責任的八字學術分析師，熟稔子平格局法、調候理氣、五行旺衰等多角度推演。

請使用繁體中文，保持專業、平靜、客觀並具同理心。不得鐵口直斷、製造恐懼、替代醫療或提供確定投資/法律建議。命理專有名詞請以 <term> 標籤包裝。若缺少可信 Evidence Bundle，請依伺服器安全規則拒答。`;

export default function AIChatPanel({ bazi }: AIChatPanelProps) {
  const [input, setInput] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [recordId, setRecordId] = useState(() => sessionStorage.getItem('bezi_chat_record_id') || '');
  const [records, setRecords] = useState<ChatRecordSummary[]>([]);
  const [hasSession, setHasSession] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastBaziSigRef = useRef('');

  const registerCurrentEvidence = useCallback(async (): Promise<string> => {
    if (!bazi?.chart) return '';
    const chart = bazi.chart;
    const currentRecord = await createCurrentEvidence({
      birthDate: `${chart.birthYear}-${String(chart.birthMonth).padStart(2, '0')}-${String(chart.birthDay).padStart(2, '0')}`,
      birthTime: chart.birthHour < 0 ? '' : String(chart.birthHour),
      gender: chart.gender === '男' ? 'male' : 'female',
    });
    setRecords(previous => [currentRecord, ...previous.filter(record => record.source !== 'current')]);
    sessionStorage.setItem('bezi_chat_record_id', currentRecord.record_id);
    setRecordId(currentRecord.record_id);
    setAuthError(null);
    return currentRecord.record_id;
  }, [bazi]);

  const { messages, setMessages, sendMessage, stop, retry, isStreaming, error } = useSSEChat(registerCurrentEvidence);

  const loadRecordsAfterAuth = useCallback(async () => {
    const demoRecords = await fetchChatRecords();
    setRecords(demoRecords);
    setHasSession(true);

    const savedRecordId = sessionStorage.getItem('bezi_chat_record_id') || '';
    if (savedRecordId.startsWith('current-')) {
      sessionStorage.removeItem('bezi_chat_record_id');
      setRecordId('');
    }

    if (bazi?.chart) {
      try {
        await registerCurrentEvidence();
      } catch {
        sessionStorage.removeItem('bezi_chat_record_id');
        setRecordId('');
        setAuthError('目前命盤驗證資料建立失敗，請重試連結；範例資料不會自動取代。');
      }
      return;
    }

    const nextRecordId = demoRecords.some(record => record.record_id === savedRecordId)
      ? savedRecordId
      : demoRecords[0]?.record_id || '';
    if (nextRecordId) sessionStorage.setItem('bezi_chat_record_id', nextRecordId);
    setRecordId(nextRecordId);
  }, [bazi, registerCurrentEvidence]);

  useEffect(() => {
    setHasSession(Boolean(sessionStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.CHAT_SESSION_TOKEN)));
  }, []);

  // [AI MOD] 靜默匿名授權：ENABLE_ANONYMOUS_CHAT 開啟時，掛載即自動取得 token，
  // 使用者免按「取得權限」。失敗（匿名模式未啟用）則保留手動授權 UI。
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await requestChatSession();
        if (cancelled) return;
        await loadRecordsAfterAuth();
      } catch {
        if (!cancelled) {
          setHasSession(Boolean(sessionStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.CHAT_SESSION_TOKEN)));
          setAuthError('AI 驗證資料載入失敗，請稍後重試。');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [loadRecordsAfterAuth]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, status]);
  useEffect(() => {
    const signature = bazi ? `${bazi.year}-${bazi.month}-${bazi.day}-${bazi.time}-${bazi.chart?.gender}-${bazi.chart?.dayMaster}` : 'none';
    if (signature === lastBaziSigRef.current) return;
    lastBaziSigRef.current = signature;
    setMessages([{
      id: crypto.randomUUID(), role: 'assistant', status: 'done', createdAt: Date.now(),
      content: bazi
        ? `您好！你的命盤已連結。你可以從今日、工作、感情或接下來三個月開始提問。`
        : '您好！我是你的 AI 八字分析助手，可以先從今日提醒或人生趨勢開始。',
    }]);
  }, [bazi, setMessages]);

  const submit = () => {
    const value = input.trim();
    if (!value || isStreaming || !hasSession || !recordId) return;
    setInput('');
    setStatus('分析中...');
    trackProductEvent('ai_question_sent');
    void sendMessage(value, SYSTEM_PROMPT + (customPrompt.trim() ? `\n\n使用者偏好：${customPrompt.trim()}` : ''), recordId).finally(() => setStatus(null));
  };

  const authenticate = async () => {
    setAuthError(null);
    try {
      await requestChatSession(clientSecret);
      await loadRecordsAfterAuth();
      setClientSecret('');
    } catch {
      sessionStorage.removeItem(CLIENT_CONFIG.STORAGE_KEYS.CHAT_SESSION_TOKEN);
      setHasSession(false);
      setAuthError('授權失敗，請檢查登入資訊。');
    }
  };

  const retryEvidence = async () => {
    setAuthError(null);
    try {
      if (bazi?.chart) await registerCurrentEvidence();
      else await loadRecordsAfterAuth();
    } catch {
      setAuthError('目前命盤驗證資料仍無法建立，請稍後再試。');
    }
  };

  return <div className="flex h-full flex-col rounded-2xl border border-zen-border bg-zen-surface/10 p-4">
    <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/5 pb-3">
      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-zen-text">
          <span className={`h-2 w-2 rounded-full ${hasSession && recordId ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          {hasSession && recordId ? '已連結目前命盤' : '正在準備你的命盤'}
        </div>
        <p className="mt-1 text-[10px] text-zen-muted">AI 只會使用這次問答所需的資料。{hasSession && <span className="ml-1 text-zen-muted/70">已授權</span>}</p>
        {hasSession && recordId && records.find(record => record.record_id === recordId)?.source === 'current' && <span className="mt-1 block text-[9px] text-zen-muted/60">已連結目前命盤 Evidence</span>}
      </div>
      <select aria-label="命盤記錄" value={recordId} onChange={event => { setRecordId(event.target.value); sessionStorage.setItem('bezi_chat_record_id', event.target.value); }} disabled={isStreaming || !hasSession} className="max-w-[150px] rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-[10px] text-zen-text focus:outline-none focus-visible:ring-2 focus-visible:ring-zen-gold">
        <option value="">{hasSession ? '選擇命盤' : '準備中'}</option>
        {records.map(record => <option key={record.record_id} value={record.record_id}>{record.source === 'current' ? '目前命盤（本次工作階段）' : `範例 · ${record.birth}`}</option>)}
      </select>
      <details className="relative">
        <summary className="cursor-pointer list-none rounded-lg px-2 py-1 text-[10px] text-zen-muted hover:bg-white/5">資料來源與設定</summary>
        <div className="absolute right-0 top-8 z-10 w-64 rounded-xl border border-white/10 bg-zinc-950 p-3 shadow-2xl">
          <div className="grid gap-2">
            <label className="text-[10px] text-zen-muted" htmlFor="ai-client-secret">授權密碼（需要時才填）</label>
            <input id="ai-client-secret" aria-label="授權密碼" type="password" value={clientSecret} onChange={event => setClientSecret(event.target.value)} placeholder="輸入授權密碼" disabled={hasSession || isStreaming} className="rounded-lg border border-white/20 bg-black/60 px-2.5 py-1.5 text-xs text-zen-text focus:outline-none focus-visible:ring-2 focus-visible:ring-zen-gold" />
            <button onClick={() => void authenticate()} disabled={hasSession || isStreaming} className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400 disabled:opacity-30">{hasSession ? '已準備完成' : '重新連結'}</button>
            <div className="text-[10px] text-zen-muted">{authError || (hasSession && recordId ? '目前命盤已連結' : '等待命盤連結')}</div>
            {authError && hasSession && <button onClick={() => void retryEvidence()} className="text-left text-[10px] text-amber-400 underline">重試連結</button>}
          </div>
        </div>
      </details>
    </div>
    <div className="mb-3 shrink-0 border-b border-white/5 pb-3">
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor="custom-prompt-textarea" className="text-[10px] uppercase tracking-wider text-zen-gold">🔧 自訂 AI 諮詢引導（可選）</label>
        <button onClick={() => setCustomPrompt('')} disabled={!customPrompt} className="flex items-center gap-1 text-[10px] text-zen-muted disabled:opacity-40"><RotateCcw className="h-2.5 w-2.5" />重設</button>
      </div>
      <textarea id="custom-prompt-textarea" value={customPrompt} onChange={event => setCustomPrompt(event.target.value)} disabled={isStreaming} rows={2} placeholder="例如：請多使用子平法細談" className="w-full resize-none rounded-lg border border-white/20 bg-black/60 px-2.5 py-1.5 text-[11px] text-zen-text focus:outline-none" />
    </div>
    <div className="mb-3 flex flex-wrap gap-2" aria-label="建議問題">
      {['今天要注意什麼？', '最近工作狀態如何？', '感情互動有什麼提醒？', '接下來三個月重點？'].map(prompt => (
        <button key={prompt} type="button" onClick={() => setInput(prompt)} disabled={isStreaming || !hasSession || !recordId} className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 text-[11px] text-amber-200/90 transition-colors hover:bg-amber-500/15 disabled:opacity-40">{prompt}</button>
      ))}
    </div>
    <div ref={scrollRef} className="mb-3 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1" role="log" aria-live="polite">
      {messages.map(message => <div key={message.id} className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        {message.role === 'assistant' && <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10"><Bot className="h-3 w-3 text-amber-400" /></div>}
        <div className="max-w-[85%] space-y-1"><div className={`rounded-xl border px-3 py-2 text-xs leading-relaxed ${message.role === 'user' ? 'border-amber-500/20 bg-amber-500/10 text-amber-300' : 'border-white/5 bg-black/30 text-zen-text'}`}><AIMessage content={message.content} /></div><span className="block pr-1 text-right text-[9px] text-zen-muted/30">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
        {message.role === 'user' && <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-pink-500/20 bg-pink-500/10"><User className="h-3 w-3 text-pink-400" /></div>}
      </div>)}
    </div>
    <div className="flex shrink-0 gap-2"><label className="sr-only" htmlFor="ai-question-input">向 AI 提問</label><input id="ai-question-input" value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); } }} disabled={isStreaming || !hasSession || !recordId} placeholder={isStreaming ? '分析中，請稍候...' : !hasSession || !recordId ? '正在準備命盤...' : '向命理師提問...'} className="flex-1 rounded-xl border border-white/5 bg-black/40 px-3 py-2 text-xs text-zen-text focus:outline-none focus-visible:ring-2 focus-visible:ring-zen-gold" /><button aria-label={isStreaming ? '停止分析' : '送出問題'} onClick={isStreaming ? stop : submit} disabled={!isStreaming && (!input.trim() || !hasSession || !recordId)} className="flex items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-amber-400 disabled:opacity-30">{isStreaming ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />停止</> : <Send className="h-3.5 w-3.5" />}</button></div>
    <div className="mt-3 shrink-0 border-t border-white/5 pt-2.5">{isStreaming && <div className="flex items-center gap-2 rounded-lg border border-amber-500/10 bg-amber-500/5 px-2 py-1.5 text-[11px] text-amber-400/80"><Loader2 className="h-3 w-3 animate-spin" />{status || '正在分析'}</div>}{!isStreaming && messages.some(message => message.status === 'stopped' || message.status === 'error') && <button onClick={retry} className="flex items-center gap-1 text-[11px] text-amber-400"><RotateCcw className="h-3 w-3" />重試最近一次提問</button>}{error && <div className="mt-2 flex items-center gap-2 text-[11px] text-red-400"><AlertTriangle className="h-3 w-3" />{error}</div>}{!isStreaming && !error && <div className="flex items-center gap-1.5 px-1 py-0.5 text-[10px] text-zen-muted/30"><Sparkles className="h-3 w-3 text-pink-500/40" />對話內容皆安全傳輸</div>}</div>
  </div>;
}
