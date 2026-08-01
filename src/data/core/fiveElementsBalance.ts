import type { FiveElement, DayMasterStrength } from './types';

export interface ElementBalanceRule {
  dayMasterElement: FiveElement;
  strength: DayMasterStrength;
  goodElements: FiveElement[];
  badElements: FiveElement[];
}

// 根據講義邏輯：
// 剋、洩、耗 (Weakening) = 財、官殺、食傷
// 生、扶 (Strengthening) = 印、比劫
const ELEMENTS_WEAKENING: Record<FiveElement, FiveElement[]> = {
  木: ['火', '土', '金'],
  火: ['土', '金', '水'],
  土: ['金', '水', '木'],
  金: ['水', '木', '火'],
  水: ['木', '火', '土'],
};

const ELEMENTS_STRENGTHENING: Record<FiveElement, FiveElement[]> = {
  木: ['水', '木'],
  火: ['木', '火'],
  土: ['火', '土'],
  金: ['土', '金'],
  水: ['金', '水'],
};

// 格局對應：身強/從弱 喜剋洩耗，身弱/從強 喜生扶
function getEffectiveStrength(strength: DayMasterStrength): '身強' | '身弱' {
  return (strength === '身強' || strength === '從弱') ? '身強' : '身弱';
}

export const ELEMENT_BALANCE_RULES: ElementBalanceRule[] = ([] as ElementBalanceRule[]).concat(
  ...(['木', '火', '土', '金', '水'] as FiveElement[]).map(element => [
    {
      dayMasterElement: element,
      strength: '身強' as DayMasterStrength,
      goodElements: ELEMENTS_WEAKENING[element],
      badElements: ELEMENTS_STRENGTHENING[element],
    },
    {
      dayMasterElement: element,
      strength: '從弱' as DayMasterStrength,
      goodElements: ELEMENTS_WEAKENING[element],
      badElements: ELEMENTS_STRENGTHENING[element],
    },
    {
      dayMasterElement: element,
      strength: '身弱' as DayMasterStrength,
      goodElements: ELEMENTS_STRENGTHENING[element],
      badElements: ELEMENTS_WEAKENING[element],
    },
    {
      dayMasterElement: element,
      strength: '從強' as DayMasterStrength,
      goodElements: ELEMENTS_STRENGTHENING[element],
      badElements: ELEMENTS_WEAKENING[element],
    },
  ])
);

export function getElementBalanceRule(element: FiveElement, strength: DayMasterStrength) {
  return ELEMENT_BALANCE_RULES.find(r => r.dayMasterElement === element && r.strength === strength);
}

// 推算流年與補運邏輯
// isDayunGood = 當前大運五行是否在 goodElements 內
export function getLiunianAndRemedy(element: FiveElement, strength: DayMasterStrength, isDayunGood: boolean) {
  const effective = getEffectiveStrength(strength);
  const weakening = ELEMENTS_WEAKENING[element];
  const strengthening = ELEMENTS_STRENGTHENING[element];

  if (effective === '身強') {
    return {
      goodLiunian: weakening,
      badLiunian: strengthening,
      remedy: weakening,
    };
  } else {
    // 身弱 / 從強
    if (isDayunGood) {
      return {
        goodLiunian: weakening,
        badLiunian: strengthening,
        remedy: weakening,
      };
    } else {
      return {
        goodLiunian: strengthening,
        badLiunian: weakening,
        remedy: strengthening,
      };
    }
  }
}
