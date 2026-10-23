export type TopArea = 'today' | 'explore' | 'learn' | 'profile';

export function getTopArea(step: number): TopArea {
  if ([6, 7, 8, 9, 11].includes(step)) return 'explore';
  if (step === 10) return 'learn';
  if (step === 12) return 'profile';
  return 'today';
}
