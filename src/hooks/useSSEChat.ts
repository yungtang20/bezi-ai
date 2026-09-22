import { useCallback, useEffect, useRef, useState } from 'react';
import { CLIENT_CONFIG, getChatAuthHeaders } from '../config';

export type ChatMessageStatus = 'streaming' | 'done' | 'error' | 'stopped';
export type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string; status: ChatMessageStatus; createdAt: number };
const SAFE_ERROR = '目前無法完成分析，請稍後再試。';
const AUTH_ERROR = '授權失敗，請重新登入後再試。';

export function useSSEChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const controllerRef = useRef<AbortController | null>(null);
  const lastPromptRef = useRef<{ content: string; customPrompt: string; recordId: string } | null>(null);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const sendMessage = useCallback(async (content: string, customPrompt: string, recordId: string) => {
    if (!content.trim() || controllerRef.current) return;
    const user: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: content.trim(), status: 'done', createdAt: Date.now() };
    const assistant: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: '', status: 'streaming', createdAt: Date.now() };
    const requestMessages = [...messagesRef.current, user].map(({ role, content: messageContent }) => ({ role, content: messageContent }));
    lastPromptRef.current = { content: content.trim(), customPrompt, recordId };
    setMessages(previous => [...previous, user, assistant]);
    setError(null);
    setIsStreaming(true);
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const response = await fetch(CLIENT_CONFIG.API.CHAT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getChatAuthHeaders() }, body: JSON.stringify({ messages: requestMessages, customPrompt, record_id: recordId }), signal: controller.signal });
      if (response.status === 401) throw new Error('unauthorized');
      if (!response.ok || !response.body) throw new Error('request failed');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (!data || data === '[DONE]') continue;
          const parsed = JSON.parse(data) as { content?: string; error?: string };
          if (parsed.error) throw new Error('server error');
          if (parsed.content) setMessages(previous => previous.map(message => message.id === assistant.id ? { ...message, content: message.content + parsed.content } : message));
        }
      }
      setMessages(previous => previous.map(message => message.id === assistant.id ? { ...message, status: 'done' } : message));
    } catch (caught) {
      if (controller.signal.aborted || (caught instanceof DOMException && caught.name === 'AbortError')) {
        setMessages(previous => previous.map(message => message.id === assistant.id ? { ...message, status: 'stopped', content: message.content || '已停止生成。' } : message));
      } else {
        const message = caught instanceof Error && caught.message === 'unauthorized' ? AUTH_ERROR : SAFE_ERROR;
        setError(message);
        setMessages(previous => previous.map(item => item.id === assistant.id ? { ...item, status: 'error', content: message } : item));
      }
    } finally {
      controllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const stop = useCallback(() => controllerRef.current?.abort(), []);
  const retry = useCallback(() => {
    if (controllerRef.current || !lastPromptRef.current) return;
    const lastUserIndex = [...messages].map(message => message.role).lastIndexOf('user');
    if (lastUserIndex < 0) return;
    const prompt = lastPromptRef.current;
    const trimmedMessages = messages.slice(0, lastUserIndex);
    messagesRef.current = trimmedMessages;
    setMessages(trimmedMessages);
    void sendMessage(prompt.content, prompt.customPrompt, prompt.recordId);
  }, [messages, sendMessage]);

  return { messages, setMessages, sendMessage, stop, retry, isStreaming, error };
}
