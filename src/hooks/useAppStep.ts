// useAppStep — step state machine with hash deep-link + sessionStorage persistence.
// 步驟狀態機：hash 深度連結 + sessionStorage 記憶，與 App 副作用分離。
import { useCallback, useEffect, useRef, useState } from "react";
import { parseStepFromHash, stepToHash } from "../lib/router";
import { CLIENT_CONFIG } from "../config";

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

const VALID_STEPS: Step[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

interface UseAppStepReturn {
  step: Step;
  setStep: (next: Step) => void;
  handleNavigate: (target: number | string) => void;
}

export function useAppStep(initialFromHash?: Step): UseAppStepReturn {
  const [step, setStepState] = useState<Step>(() => {
    const fromHash = parseStepFromHash(window.location.hash);
    if (fromHash) return fromHash;
    const saved = sessionStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.CURRENT_STEP);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (parsed === 5) return 4;
      if (VALID_STEPS.includes(parsed as Step)) return parsed as Step;
    }
    return 1;
  });

  const stepRef = useRef(step);
  stepRef.current = step;

  // back/forward 鍵：hash 變更時同步 step（忽略本端寫入引發的 event）。
  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseStepFromHash(window.location.hash);
      if (parsed && parsed !== stepRef.current) {
        setStepState(parsed);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // step 變更 → 寫回 hash（deep-link 可分享、back 鍵可回退）。
  useEffect(() => {
    const target = stepToHash(step);
    if (window.location.hash !== target) {
      window.location.hash = target;
    }
  }, [step]);

  // sessionStorage 記憶（step === 5 回退 4，避免重複進入校準）。
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (step === 5) {
      setStepState(4);
      return;
    }
    sessionStorage.setItem(CLIENT_CONFIG.STORAGE_KEYS.CURRENT_STEP, step.toString());
  }, [step]);

  const setStep = useCallback((next: Step) => {
    setStepState(next);
  }, []);

  const handleNavigate = useCallback((target: number | string) => {
    const s = typeof target === "string" ? parseInt(target, 10) : target;
    if (!Number.isNaN(s) && s >= 1 && s <= 12) {
      setStep(s as Step);
    }
  }, [setStep]);

  return { step, setStep, handleNavigate };
}
