// useCalibration — quick calibration (2 years) + scores persistence.
// 快速校準：兩題 + 得分持久化，與 App 副作用分離。
import { useCallback, useState } from "react";
import { applyCalibrationDelta } from "../calibration";
import { getPatternScores, savePatternScores } from "../storage";
import { PatternScores, PatternResult } from "../pattern";

const RETURN_AFTER_EDIT_KEY = "bezi:return-after-edit";

interface UseCalibrationReturn {
  scores: PatternScores | null;
  setScores: (s: PatternScores | null) => void;
  calibrations: Record<string, string>;
  setCalibrations: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleCalibration: (year: string, value: string) => void;
  skipCalibration: () => void;
  loadScores: () => Promise<void>;
}

export function useCalibration(
  initialScores: PatternScores | null,
  initialPattern: PatternResult | null
): UseCalibrationReturn {
  const [scores, setScoresState] = useState<PatternScores | null>(initialScores);
  const [calibrations, setCalibrationsState] = useState<Record<string, string>>({});

  const loadScores = useCallback(async () => {
    try {
      const saved = await getPatternScores();
      if (saved) {
        setScoresState(saved);
      }
    } catch {
      // silent: DB errors shouldn't block the UI
    }
  }, []);

  const setScores = useCallback((next: PatternScores | null) => {
    setScoresState(next);
  }, []);

  const handleCalibration = useCallback(
    (year: string, value: string) => {
      if (!scores || !initialPattern) return;

      if (value === "順利" || value === "不順") {
        const nextScores = applyCalibrationDelta(scores, value, initialPattern.pattern);
        setScoresState(nextScores);
        void savePatternScores(nextScores).catch(() => {
          // silent
        });
      }

      setCalibrationsState((prev) => {
        const next = { ...prev, [year]: value };
        if (Object.keys(next).length === 2) {
          const returnStep = sessionStorage.getItem(RETURN_AFTER_EDIT_KEY) === "12" ? "12" : "4";
          sessionStorage.removeItem(RETURN_AFTER_EDIT_KEY);
          window.location.hash = `#/${returnStep}`;
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return next;
      });
    },
    [scores, initialPattern]
  );

  const skipCalibration = useCallback(() => {
    const returnStep = sessionStorage.getItem(RETURN_AFTER_EDIT_KEY) === "12" ? "12" : "4";
    sessionStorage.removeItem(RETURN_AFTER_EDIT_KEY);
    window.location.hash = `#/${returnStep}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return {
    scores,
    setScores,
    calibrations,
    setCalibrations: setCalibrationsState,
    handleCalibration,
    skipCalibration,
    loadScores,
  };
}
