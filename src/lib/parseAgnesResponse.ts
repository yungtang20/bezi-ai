export interface AgnesMetadata {
  insight: string;
  terms: string[];
  advice: string[];
}

export interface ParsedAgnesResponse {
  content: string;
  metadata: AgnesMetadata;
  metadataValid: boolean;
}

export const EMPTY_AGNES_METADATA: AgnesMetadata = { insight: '', terms: [], advice: [] };

const JSON_FENCE = /```(?:json)?\s*([\s\S]*?)\s*```/gi;

function normalizeMetadata(value: unknown): AgnesMetadata | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<AgnesMetadata>;
  if (typeof candidate.insight !== 'string' || !Array.isArray(candidate.terms) || !Array.isArray(candidate.advice)) return null;
  if (!candidate.terms.every(term => typeof term === 'string') || !candidate.advice.every(item => typeof item === 'string')) return null;
  return {
    insight: candidate.insight.slice(0, 1000),
    terms: candidate.terms.map(term => term.slice(0, 100)).slice(0, 50),
    advice: candidate.advice.map(item => item.slice(0, 500)).slice(0, 20),
  };
}

export function parseAgnesResponse(raw: string): ParsedAgnesResponse {
  const source = typeof raw === 'string' ? raw : '';
  let match: RegExpExecArray | null;
  let lastMatch: RegExpExecArray | null = null;
  while ((match = JSON_FENCE.exec(source))) lastMatch = match;
  JSON_FENCE.lastIndex = 0;

  if (!lastMatch) return { content: source, metadata: { ...EMPTY_AGNES_METADATA }, metadataValid: false };

  try {
    const metadata = normalizeMetadata(JSON.parse(lastMatch[1]));
    const content = `${source.slice(0, lastMatch.index)}${source.slice(lastMatch.index + lastMatch[0].length)}`.trim();
    return { content, metadata: metadata || { ...EMPTY_AGNES_METADATA }, metadataValid: Boolean(metadata) };
  } catch {
    return { content: source, metadata: { ...EMPTY_AGNES_METADATA }, metadataValid: false };
  }
}
