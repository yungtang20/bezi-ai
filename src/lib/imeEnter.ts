// src/lib/imeEnter.ts — IME 組字 Enter 偵測
// 中文/日文等輸入法組字期間，使用者按 Enter 是「確認選字」而非「送出」。
// 若不加防護，會誤觸送出/新增等動作。
// keyCode === 229 為 Safari 與部分舊瀏覽器在 IME 組字期間回報的 keyCode。

export interface KeyEventLike {
  key: string;
  isComposing?: boolean;
  keyCode?: number;
  /**
   * React 的合成 KeyboardEvent 不會把原生事件的 isComposing 複製到自身
   * （KeyboardEventInterface 只含 key/code/keyCode/which 等），
   * 因此必須改讀 nativeEvent.isComposing 才能在組字期間攔下 Enter。
   */
  nativeEvent?: { isComposing?: boolean };
}

/** Enter 是否為 IME 組字確認鍵（應忽略，不得觸發送出）。 */
export function isImeCompositionEnter(e: KeyEventLike): boolean {
  if (e.key !== 'Enter') return false;
  return (
    e.isComposing === true ||
    e.keyCode === 229 ||
    e.nativeEvent?.isComposing === true
  );
}
