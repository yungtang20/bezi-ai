import { useState, useRef, useCallback } from 'react';

// [AI MOD] 內部型別，不 export
interface BirthFormData {
  name: string;
  gender: 'male' | 'female' | null;
  birthDate: string;
  birthTime: string;
  birthTimeInput: string;
  hourError: string;
  isFormValid: boolean;
}

// [AI MOD] 內部型別，不 export
interface BirthFormActions {
  setName: (v: string) => void;
  setGender: (v: 'male' | 'female' | null) => void;
  setBirthDate: (v: string) => void;
  setBirthTime: (v: string) => void;
  setBirthTimeInput: (v: string) => void;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  parseHourInput: (input: string) => void;
  handleTimeKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  timeInputRef: React.RefObject<HTMLInputElement | null>;
  focusTimeInput: () => void;
}

export function useBirthForm(): BirthFormData & BirthFormActions {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthTimeInput, setBirthTimeInput] = useState('');
  const [hourError, setHourError] = useState('');
  const timeInputRef = useRef<HTMLInputElement>(null);

  const focusTimeInput = useCallback(() => {
    setTimeout(() => timeInputRef.current?.focus(), 10);
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length >= 7) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
    } else if (digits.length >= 5) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    setBirthDate(formatted);
    if (digits.length === 8) {
      setTimeout(() => timeInputRef.current?.focus(), 10);
    }
  }, []);

  const parseHourInput = useCallback((input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length >= 3 ? `${digits.slice(0, 2)}:${digits.slice(2, 4)}` : digits;
    setBirthTimeInput(formatted);

    if (!digits) {
      setBirthTime('');
      setHourError('');
      return;
    }

    const hour = parseInt(digits.slice(0, 2), 10);
    if (hour > 23) {
      setBirthTime('');
      setHourError('請輸入有效的小時 (00-23)');
      return;
    }

    if (digits.length === 3) {
      setBirthTime('');
      setHourError('請輸入完整的分鐘 (HHmm)');
      return;
    }

    if (digits.length >= 3 && parseInt(digits.slice(2, 4), 10) > 59) {
      setBirthTime('');
      setHourError('請輸入有效的分鐘 (00-59)');
      return;
    }

    const minStr = digits.length >= 3 ? digits.slice(2, 4) : '00';
    const hourStr = digits.slice(0, 2).padStart(2, '0');
    setBirthTime(`${hourStr}:${minStr}`);
    setHourError('');
  }, []);

  const handleTimeKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setTimeout(() => {
        const startBtn = document.getElementById('start-calculation-btn');
        if (startBtn && !startBtn.hasAttribute('disabled')) {
          startBtn.click();
        }
      }, 50);
    }
  }, []);

  const isFormValid = !!(gender && birthDate && birthDate.length === 10 && !hourError);

  return {
    name, gender, birthDate, birthTime, birthTimeInput, hourError, isFormValid,
    setName, setGender, setBirthDate, setBirthTime, setBirthTimeInput,
    handleDateChange, parseHourInput, handleTimeKeyDown, timeInputRef, focusTimeInput,
  };
}
