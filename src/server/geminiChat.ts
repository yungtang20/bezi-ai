import type { Content } from '@google/genai';

export interface GeminiSourceMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Convert the app's provider-neutral chat history to Gemini content roles. */
export function toGeminiContents(messages: GeminiSourceMessage[]): Content[] {
  return messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));
}
