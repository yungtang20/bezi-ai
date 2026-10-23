// src/lib/trueSolarCities.ts
// [P2] 真太陽時「出生城市」快選：台灣主要城市經度。
// 預設 empty（不用真太陽時）；選了城市才把出生時刻轉成真太陽時。
// 經度為城市中心，誤差對「時辰（2 小時）邊界」判斷可接受。

export interface BirthCity {
  name: string;
  longitude: number;
}

export const BIRTH_CITIES: BirthCity[] = [
  { name: '台北', longitude: 121.5 },
  { name: '桃園', longitude: 121.3 },
  { name: '台中', longitude: 120.67 },
  { name: '台南', longitude: 120.22 },
  { name: '高雄', longitude: 120.3 },
  { name: '花蓮', longitude: 121.6 },
  { name: '台東', longitude: 121.15 },
];

/** 城市名 → 經度；找不到回 undefined。 */
export function cityLongitude(name: string): number | undefined {
  const city = BIRTH_CITIES.find((c) => c.name === name);
  return city ? city.longitude : undefined;
}
