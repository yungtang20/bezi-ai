// src/lib/useDialog.ts — 原生 <dialog> 開啟/關閉同步
import { useEffect, useRef } from 'react';

/**
 * 依 isOpen 同步 <dialog> 的 showModal()/close()。
 * showModal() 免費提供：top-layer、inert 背景、focus trap、
 * Escape（cancel→close）與 ::backdrop。
 * 關閉動畫的同步（onClose 回寫狀態）由元件自行掛在 <dialog onClose> 上。
 */
export function useDialog(isOpen: boolean) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return ref;
}
