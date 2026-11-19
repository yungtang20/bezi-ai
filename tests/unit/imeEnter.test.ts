// tests/unit/imeEnter.test.ts — IME 組字 Enter 防護回歸測試
import { describe, it, expect } from 'vitest';
import { isImeCompositionEnter } from '../../src/lib/imeEnter';

describe('isImeCompositionEnter', () => {
  it('忽略 IME 組字期間的 Enter（isComposing）', () => {
    expect(isImeCompositionEnter({ key: 'Enter', isComposing: true })).toBe(
      true
    );
  });

  it('忽略 Safari 組字期間回報的 keyCode 229', () => {
    expect(isImeCompositionEnter({ key: 'Enter', keyCode: 229 })).toBe(true);
  });

  it('忽略 React 合成事件：組字期間由 nativeEvent.isComposing 判定', () => {
    // React 合成 KeyboardEvent 不暴露 isComposing，只有 nativeEvent 有。
    expect(
      isImeCompositionEnter({
        key: 'Enter',
        keyCode: 13,
        nativeEvent: { isComposing: true },
      })
    ).toBe(true);
  });

  it('一般 Enter（非組字）不視為 IME', () => {
    expect(isImeCompositionEnter({ key: 'Enter', isComposing: false })).toBe(
      false
    );
    expect(isImeCompositionEnter({ key: 'Enter' })).toBe(false);
    expect(
      isImeCompositionEnter({
        key: 'Enter',
        keyCode: 13,
        nativeEvent: { isComposing: false },
      })
    ).toBe(false);
  });

  it('非 Enter 鍵一律 false', () => {
    expect(isImeCompositionEnter({ key: 'Shift', isComposing: true })).toBe(
      false
    );
    expect(
      isImeCompositionEnter({ key: 'Enter', keyCode: 13, isComposing: false })
    ).toBe(false);
  });
});
