import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bot, Loader2, RotateCcw, Send, Sparkles, User } from 'lucide-react';
import { BaziDisplay } from '../types';
import AIMessage from './chat/AIMessage';
import { useSSEChat } from '../hooks/useSSEChat';
import { CLIENT_CONFIG, fetchChatRecords, requestChatSession, type ChatRecordSummary } from '../config';

interface AIChatPanelProps { bazi?: BaziDisplay | null; userName?: string; }

const SYSTEM_PROMPT = `你是一位專業且負責任的八字學術分析師，熟稔子平格局法、調候理氣、五行旺衰等多角度推演。

請使用繁體中文，保持專業、平靜、客觀並具同理心。不得鐵口直斷、製造恐懼、替代醫療或提供確定投資/法律建議。命理專有名詞請以 <term> 標籤包裝。若缺少可信 Evidence Bundle，請依伺服器安全規則拒答。`;

export default function AIChatPanel({ bazi, userName }: AIChatPanelProps) {
  const { messages, setMessages, sendMessage, stop, retry, isStreaming, error } = useSSEChat();
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

  useEffect(() => {
    setHasSession(Boolean(sessionStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.CHAT_SESSION_TOKEN)));
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, status]);
  useEffect(() => {
    const signature = bazi ? `${bazi.year}-${bazi.month}-${bazi.day}-${bazi.time}-${bazi.chart?.gender}-${bazi.chart?.dayMaster}` : 'none';
    if (signature === lastBaziSigRef.current) return;
    lastBaziSigRef.current = signature;
    setMessages([{
      id: crypto.randomUUID(), role: 'assistant', status: 'done', createdAt: Date.now(),
      content: bazi
        ? `您好！我已經順利載入 ${userName || '您'} 的八字命局檔案（日主為 ${bazi.chart?.dayMaster || '？'}）。\n\n您可以詢問喜用神、事業、感情或流年。`
        : '您好！我是您的專屬 AI 智慧八字理氣師。請輸入您的問題。',
    }]);
  }, [bazi, setMessages, userName]);

  const buildContext = () => {
    if (!bazi?.chart) return '';
    const c = bazi.chart;
    return `\n\n命主資訊：姓名 ${userName || '未提供'}；性別 ${c.gender}；出生 ${bazi.year}年${bazi.month}月${bazi.day}日 ${bazi.time}時；年柱 ${c.year.gan}${c.year.zhi}；月柱 ${c.month.gan}${c.month.zhi}；日柱 ${c.day.gan}${c.day.zhi}；時柱 ${c.hour.gan}${c.hour.zhi}；日主 ${c.dayMaster}。`;
  };

  const submit = () => {
    const value = input.trim();
    if (!value || isStreaming || !hasSession || !recordId) return;
    setInput('');
    setStatus('分析中...');
    void sendMessage(value, SYSTEM_PROMPT + buildContext() + (customPrompt.trim() ? `\n\n使用者偏好：${customPrompt.trim()}` : ''), recordId).finally(() => setStatus(null));
  };

  const authenticate = async () => {
    setAuthError(null);
    try {
      await requestChatSession(clientSecret);
      const availableRecords = await fetchChatRecords();
      setRecords(availableRecords);
      setClientSecret('');
      setHasSession(true);
      if (availableRecords.length > 0) {
        const nextRecordId = availableRecords.some(record => record.record_id === recordId) ? recordId : availableRecords[0].record_id;
        setRecordId(nextRecordId);
        sessionStorage.setItem('bezi_chat_record_id', nextRecordId);
      }
    } catch {
      sessionStorage.removeItem(CLIENT_CONFIG.STORAGE_KEYS.CHAT_SESSION_TOKEN);
      setHasSession(false);
      setAuthError('授權失敗，請檢查登入資訊。');
    }
  };

  return <div className="flex h-full flex-col rounded-2xl border border-zen-border bg-zen-surface/10 p-4">
    <div className="mb-3 grid gap-2 border-b border-white/5 pb-3 sm:grid-cols-[1fr_auto_1fr_auto]">
      <input aria-label="授權密碼" type="password" value={clientSecret} onChange={event => setClientSecret(event.target.value)} placeholder="輸入授權密碼" disabled={hasSession || isStreaming} className="rounded-lg border border-white/20 bg-black/60 px-2.5 py-1.5 text-xs text-zen-text focus:outline-none" />
      <button onClick={() => void authenticate()} disabled={hasSession || isStreaming} className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400 disabled:opacity-30">{hasSession ? '已授權' : '取得權限'}</button>
      <select aria-label="命盤記錄" value={recordId} onChange={event => { setRecordId(event.target.value); sessionStorage.setItem('bezi_chat_record_id', event.target.value); }} disabled={isStreaming || !hasSession} className="rounded-lg border border-white/20 bg-black/60 px-2.5 py-1.5 text-xs text-zen-text focus:outline-none">
        <option value="">{hasSession ? '選擇命盤' : '請先取得權限'}</option>
        {records.map(record => <option key={record.record_id} value={record.record_id}>{record.record_id} · {record.birth}</option>)}
      </select>
      <span className="self-center text-[10px] text-zen-muted">{authError || (hasSession && recordId ? '可開始分析' : '需授權並選擇命盤')}</span>
    </div>
    <div className="mb-3 shrink-0 border-b border-white/5 pb-3">
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor="custom-prompt-textarea" className="text-[10px] uppercase tracking-wider text-zen-gold">🔧 自訂 AI 諮詢引導（可選）</label>
        <button onClick={() => setCustomPrompt('')} disabled={!customPrompt} className="flex items-center gap-1 text-[10px] text-zen-muted disabled:opacity-40"><RotateCcw className="h-2.5 w-2.5" />重設</button>
      </div>
      <textarea id="custom-prompt-textarea" value={customPrompt} onChange={event => setCustomPrompt(event.target.value)} disabled={isStreaming} rows={2} placeholder="例如：請多使用子平法細談" className="w-full resize-none rounded-lg border border-white/20 bg-black/60 px-2.5 py-1.5 text-[11px] text-zen-text focus:outline-none" />
    </div>
    <div ref={scrollRef} className="mb-3 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1" role="log">
      {messages.map(message => <div key={message.id} className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        {message.role === 'assistant' && <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10"><Bot className="h-3 w-3 text-amber-400" /></div>}
        <div className="max-w-[85%] space-y-1"><div className={`rounded-xl border px-3 py-2 text-xs leading-relaxed ${message.role === 'user' ? 'border-amber-500/20 bg-amber-500/10 text-amber-300' : 'border-white/5 bg-black/30 text-zen-text'}`}><AIMessage content={message.content} /></div><span className="block pr-1 text-right text-[9px] text-zen-muted/30">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
        {message.role === 'user' && <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-pink-500/20 bg-pink-500/10"><User className="h-3 w-3 text-pink-400" /></div>}
      </div>)}
    </div>
    <div className="flex shrink-0 gap-2"><input value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); } }} disabled={isStreaming || !hasSession || !recordId} placeholder={isStreaming ? '論命中，請稍候...' : !hasSession || !recordId ? '請先授權並選擇命盤' : '向命理師提問...'} className="flex-1 rounded-xl border border-white/5 bg-black/40 px-3 py-2 text-xs text-zen-text focus:outline-none" /><button onClick={isStreaming ? stop : submit} disabled={!isStreaming && (!input.trim() || !hasSession || !recordId)} className="flex items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-amber-400 disabled:opacity-30">{isStreaming ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />停止</> : <Send className="h-3.5 w-3.5" />}</button></div>
    <div className="mt-3 shrink-0 border-t border-white/5 pt-2.5">{isStreaming && <div className="flex items-center gap-2 rounded-lg border border-amber-500/10 bg-amber-500/5 px-2 py-1.5 text-[11px] text-amber-400/80"><Loader2 className="h-3 w-3 animate-spin" />{status || '正在分析'}</div>}{!isStreaming && messages.some(message => message.status === 'stopped' || message.status === 'error') && <button onClick={retry} className="flex items-center gap-1 text-[11px] text-amber-400"><RotateCcw className="h-3 w-3" />重試最近一次提問</button>}{error && <div className="mt-2 flex items-center gap-2 text-[11px] text-red-400"><AlertTriangle className="h-3 w-3" />{error}</div>}{!isStreaming && !error && <div className="flex items-center gap-1.5 px-1 py-0.5 text-[10px] text-zen-muted/30"><Sparkles className="h-3 w-3 text-pink-500/40" />對話內容皆安全傳輸</div>}</div>
  </div>;
}
