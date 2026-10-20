export type EvidenceSourceType = 'sql' | 'mcp';
export type AIStatus = 'answered' | 'needs_data' | 'conflict' | 'refused';
export type Confidence = 'high' | 'medium' | 'low';

export interface EvidenceItem {
  sourceId: string;
  sourceType: EvidenceSourceType;
  title: string;
  content: string;
  retrievedAt: string;
  schemaVersion: string;
  supports: string[];
}

export interface EvidenceBundle {
  requestId: string;
  userId: string;
  query: string;
  items: EvidenceItem[];
  limitations: string[];
  allowedClaims: string[];
  expiresAt: string;
  source?: { type: EvidenceSourceType; id: string };
}

export interface AIClaim {
  text: string;
  sourceIds: string[];
  confidence: Confidence;
}

export interface AIOutput {
  status: AIStatus;
  answer: string;
  claims: AIClaim[];
  limitations: string[];
  nextQuestions: string[];
  disclaimer?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

export function validateEvidenceBundle(bundle: unknown): ValidationResult {
  const errors: string[] = [];
  if (!bundle || typeof bundle !== 'object') return { valid: false, errors: ['Evidence Bundle 格式無效。'] };
  const value = bundle as Partial<EvidenceBundle>;
  if (typeof value.requestId !== 'string' || !value.requestId) errors.push('缺少 requestId。');
  if (typeof value.userId !== 'string' || !value.userId) errors.push('缺少 userId。');
  if (typeof value.query !== 'string' || !value.query) errors.push('缺少 query。');
  if (!Array.isArray(value.items)) errors.push('items 必須是陣列。');
  if (!Array.isArray(value.limitations)) errors.push('limitations 必須是陣列。');
  if (!Array.isArray(value.allowedClaims)) errors.push('allowedClaims 必須是陣列。');
  if (typeof value.expiresAt !== 'string' || !ISO_DATE.test(value.expiresAt)) errors.push('expiresAt 必須是 UTC ISO-8601。');
  for (const item of value.items || []) {
    if (!item || typeof item !== 'object') {
      errors.push('Evidence item 格式無效。');
      continue;
    }
    const evidence = item as Partial<EvidenceItem>;
    if (!/^(sql|mcp):[^\s]+$/.test(evidence.sourceId || '')) errors.push('sourceId 格式無效。');
    if (evidence.sourceType !== 'sql' && evidence.sourceType !== 'mcp') errors.push('sourceType 無效。');
    if (typeof evidence.content !== 'string' || !evidence.content) errors.push('Evidence content 不得為空。');
    if (!Array.isArray(evidence.supports)) errors.push('Evidence supports 必須是陣列。');
  }
  return { valid: errors.length === 0, errors };
}

export function validateAIOutput(output: unknown, bundle: EvidenceBundle): ValidationResult {
  const errors: string[] = [];
  if (!output || typeof output !== 'object') return { valid: false, errors: ['AI output 必須是 JSON 物件。'] };
  const value = output as Partial<AIOutput>;
  if (!['answered', 'needs_data', 'conflict', 'refused'].includes(value.status || '')) errors.push('status 無效。');
  if (typeof value.answer !== 'string') errors.push('answer 必須是字串。');
  if (!Array.isArray(value.claims)) errors.push('claims 必須是陣列。');
  const sourceIds = new Set(bundle.items.map(item => item.sourceId));
  for (const claim of value.claims || []) {
    if (!claim || typeof claim !== 'object' || typeof claim.text !== 'string' || !claim.text) {
      errors.push('claim 格式無效。');
      continue;
    }
    if (!Array.isArray(claim.sourceIds) || claim.sourceIds.length === 0) errors.push('每個 claim 必須有 sourceId。');
    for (const sourceId of claim.sourceIds || []) {
      if (!sourceIds.has(sourceId)) errors.push(`引用不存在的 sourceId：${sourceId}`);
    }
    if (!['high', 'medium', 'low'].includes(claim.confidence || '')) errors.push('claim confidence 無效。');
  }
  if (value.status === 'answered' && (!value.claims || value.claims.length === 0)) errors.push('answered 不得沒有 claims。');
  if (value.status !== 'answered' && (value.claims || []).length > 0) errors.push('非 answered 不得產生推測性 claims。');
  if (!Array.isArray(value.limitations)) errors.push('limitations 必須是陣列。');
  if (!Array.isArray(value.nextQuestions)) errors.push('nextQuestions 必須是陣列。');
  return { valid: errors.length === 0, errors };
}

export function missingEvidenceOutput(missing: string[]): AIOutput {
  return {
    status: 'needs_data',
    answer: `目前資料不足，無法可靠回答。請補充：${missing.join('、')}。`,
    claims: [],
    limitations: missing,
    nextQuestions: missing,
  };
}
