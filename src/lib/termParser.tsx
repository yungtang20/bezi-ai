import React from 'react';
import TermTooltip from '../components/chat/TermTooltip';
import { sanitizeTermMarkup } from './sanitize';

const MAX_TERM_LENGTH = 80;

export function parseTermSegments(value: string): Array<{ text: string; term?: string }> {
  const safe = sanitizeTermMarkup(value || '');
  const segments: Array<{ text: string; term?: string }> = [];
  const pushText = (text: string) => {
    if (!text) return;
    const previous = segments[segments.length - 1];
    if (previous && !previous.term) previous.text += text;
    else segments.push({ text });
  };
  const pattern = /<term>([\s\S]*?)<\/term>/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(safe))) {
    if (match.index > cursor) pushText(safe.slice(cursor, match.index));
    const term = match[1].replace(/<[^>]*>/g, '').trim().slice(0, MAX_TERM_LENGTH);
    if (term) segments.push({ text: term, term });
    cursor = match.index + match[0].length;
  }
  if (cursor < safe.length) pushText(safe.slice(cursor));
  return segments;
}

export function renderTermMarkup(value: string): React.ReactNode[] {
  return parseTermSegments(value).map((segment, index) => segment.term
    ? <TermTooltip key={`${segment.term}-${index}`} term={segment.term} />
    : <React.Fragment key={index}>{segment.text}</React.Fragment>);
}
