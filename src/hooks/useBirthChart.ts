// useBirthChart — birth form validation + chart calculation.
// 出生表單驗證與排盤計算，與 App 副作用分離。
import { useCallback, useRef, useState } from "react";
import {
  calculateChart,
  type BaziChart,
  determinePattern,
  type PatternResult,
  getFavorableElements,
  GAN_TO_ELEMENT,
  initPatternScores,
  type PatternScores,
} from "@bezi/core";
import type { BaziDisplay } from "@bezi/core";
import { cityLongitude } from "../lib/trueSolarCities";
import { validateBirthInput } from "../utils/validation";
import { trackProductEvent } from "../lib/productEvents";
import { CLIENT_CONFIG } from "../config";

interface BirthFormState {
  name: string;
  gender: "male" | "female";
  birthDate: string;
  birthTime: string;
  birthTimeInput: string;
  hourError: string | null;
  isFormValid: boolean;
  setName: (v: string) => void;
  setGender: (v: "male" | "female") => void;
  setBirthDate: (v: string) => void;
  setBirthTimeInput: (v: string) => void;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  parseHourInput: (v: string) => void;
  handleTimeKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

interface UseBirthChartReturn {
  timeInputRef: React.RefObject<HTMLInputElement | null>;
  form: BirthFormState;
  birthCity: string;
  setBirthCity: (v: string) => void;
  bazi: BaziDisplay | null;
  pattern: PatternResult | null;
  errorMsg: string;
  isGenerating: boolean;
  handleStart: (
    override?: { name: string; gender: "male" | "female"; birthDate: string; birthTime: string }
  ) => Promise<void>;
}

export function useBirthChart(
  onChartReady?: (bazi: BaziDisplay, pattern: PatternResult, scores: PatternScores) => void
): UseBirthChartReturn {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthTimeInput, setBirthTimeInput] = useState("");
  const [hourError, setHourError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [birthCity, setBirthCity] = useState(
    () => localStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.LONGITUDE) || ""
  );
  const [bazi, setBazi] = useState<BaziDisplay | null>(null);
  const [pattern, setPattern] = useState<PatternResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const timeInputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/\D/g, "");
      let formatted = v;
      if (v.length > 4) formatted = v.slice(0, 4) + "-" + v.slice(4, 6);
      if (v.length > 6) formatted = v.slice(0, 4) + "-" + v.slice(4, 6) + "-" + v.slice(6, 8);
      setBirthDate(formatted);
      const validation = validateBirthInput({
        name: name || "未提供",
        gender: gender === "male" ? "男" : "女",
        birthDate: formatted,
        birthTime: "",
      });
      setIsFormValid(validation.valid);
    },
    [name, gender]
  );

  const parseHourInput = useCallback((v: string) => {
    const numeric = v.replace(/\D/g, "");
    setBirthTimeInput(numeric.slice(0, 4));
    setHourError(null);
  }, []);

  const handleTimeKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }, []);

  const handleStart = useCallback(
    async (
      override?: { name: string; gender: "male" | "female"; birthDate: string; birthTime: string }
    ) => {
      if (!override && (!isFormValid || isGenerating)) return;

      const dName = override?.name ?? name;
      const dGender = override?.gender ?? gender;
      const dBirthDate = override?.birthDate ?? birthDate;
      const dBirthTime = override?.birthTime ?? birthTime;

      if (override) {
        trackProductEvent("example_chart_started");
        setName(dName);
        setGender(dGender);
        setBirthDate(dBirthDate);
        setBirthTime(dBirthTime);
        setBirthTimeInput(dBirthTime);
      }

      const isHourUnknown = !dBirthTime;
      const validation = validateBirthInput({
        name: dName || "未提供",
        gender: dGender === "male" ? "男" : "女",
        birthDate: dBirthDate,
        birthTime: isHourUnknown ? "" : dBirthTime,
      });
      if (!validation.valid) {
        setErrorMsg(validation.error!);
        return;
      }

      const [y, m, d] = dBirthDate.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      const today = new Date();
      if (dateObj > today) {
        setErrorMsg("出生日期不可大於今天");
        return;
      }
      if (y < 1900) {
        setErrorMsg("目前僅支援 1900 年之後出生的命盤");
        return;
      }

      setErrorMsg("");
      localStorage.setItem(CLIENT_CONFIG.STORAGE_KEYS.NAME, dName);
      localStorage.setItem(CLIENT_CONFIG.STORAGE_KEYS.GENDER, dGender ?? "");
      localStorage.setItem(CLIENT_CONFIG.STORAGE_KEYS.DATE, dBirthDate);
      localStorage.setItem(CLIENT_CONFIG.STORAGE_KEYS.TIME, dBirthTime);

      setIsGenerating(true);

      try {
        const hour = isHourUnknown ? 12 : parseInt(dBirthTime, 10);
        const chart = calculateChart(
          y,
          m,
          d,
          hour,
          dGender === "male" ? "男" : "女",
          isHourUnknown,
          cityLongitude(birthCity)
        );
        const patternResult = determinePattern(chart);
        const scores = initPatternScores(patternResult.score);
        const chartDisplay = {
          year: chart.year.gan + chart.year.zhi,
          month: chart.month.gan + chart.month.zhi,
          day: chart.day.gan + chart.day.zhi,
          time: chart.hour.gan + chart.hour.zhi,
          chart,
        };

        setBazi(chartDisplay);
        setPattern(patternResult);
        setBirthTime(dBirthTime);

        trackProductEvent("chart_created");

        onChartReady?.(chartDisplay, patternResult, scores);

        await new Promise((r) => setTimeout(r, 800));
        setIsGenerating(false);
      } catch (e: unknown) {
        console.error(e);
        const errMsg = e instanceof Error ? e.message : String(e);
        setErrorMsg("排盤發生錯誤: " + errMsg);
        localStorage.removeItem(CLIENT_CONFIG.STORAGE_KEYS.DATE);
        setIsGenerating(false);
      }
    },
    [name, gender, birthDate, birthTime, birthCity, isFormValid, isGenerating]
  );

  return {
    timeInputRef,
    form: {
      name,
      setName,
      gender,
      setGender,
      birthDate,
      setBirthDate,
      birthTimeInput,
      setBirthTimeInput,
      birthTime,
      hourError,
      isFormValid,
      handleDateChange,
      parseHourInput,
      handleTimeKeyDown,
    },
    birthCity,
    setBirthCity,
    bazi,
    pattern,
    isGenerating,
    errorMsg,
    handleStart,
  };
}
