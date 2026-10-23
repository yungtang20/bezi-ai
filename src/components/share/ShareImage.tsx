// src/components/share/ShareImage.tsx
// [AI MOD] 離屏分享圖擷取容器：分享時才掛載，擷取完成後卸載
import { useEffect, useRef } from 'react';

interface ShareImageProps {
  active: boolean;
  width?: number;
  onReady: (element: HTMLElement) => void;
  children: React.ReactNode;
}

export default function ShareImage({ active, width = 720, onReady, children }: ShareImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const frame = requestAnimationFrame(() => {
      // 再等一幀，確保字型與排版完成
      requestAnimationFrame(() => {
        if (ref.current) onReady(ref.current);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [active, onReady]);

  if (!active) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: '-12000px',
        top: '0',
        width: `${width}px`,
        zIndex: '-1',
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  );
}
