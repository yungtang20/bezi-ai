// src/hooks/useShareImage.ts
// [AI MOD] 分享圖產生與分享（Web Share API 優先，桌機自動降級為下載）
import { useCallback, useState } from 'react';

export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled' | 'failed';

export interface ShareImageOptions {
  fileName: string;
  title: string;
  text: string;
}

/** 從元素擷取 PNG 並分享（或下載） */
export async function captureAndShare(
  element: HTMLElement,
  options: ShareImageOptions,
): Promise<ShareOutcome> {
  // 動態載入：不進主 bundle，且僅在使用者點分享時才載入
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#080c0a',
    useCORS: true,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('image generation failed');
  const file = new File([blob], options.fileName, { type: 'image/png' });

  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: options.title, text: options.text });
      return 'shared';
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return 'cancelled';
      throw error;
    }
  }

  // 桌機／不支援檔案分享：直接下載
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = options.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'downloaded';
}

export function useShareImage() {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const share = useCallback(async (element: HTMLElement, options: ShareImageOptions) => {
    setIsSharing(true);
    setError(null);
    try {
      const outcome = await captureAndShare(element, options);
      return outcome;
    } catch {
      setError('產生分享圖失敗，請稍後再試。');
      return 'failed' as ShareOutcome;
    } finally {
      setIsSharing(false);
    }
  }, []);

  return { isSharing, error, share };
}
