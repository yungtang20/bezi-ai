import { memo, useMemo } from 'react';
import { renderTermMarkup } from '../../lib/termParser';

function AIMessage({ content }: { content: string }) {
  const rendered = useMemo(() => renderTermMarkup(content), [content]);
  return <span className="whitespace-pre-wrap">{rendered}</span>;
}

export default memo(AIMessage);
