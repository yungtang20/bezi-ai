const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateString: string): Date {
  const match = LOCAL_DATE_PATTERN.exec(dateString);
  if (!match) throw new Error(`Invalid local date: ${dateString}`);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0);
}

export function addLocalDays(dateString: string, amount: number): string {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + amount);
  return formatLocalDate(date);
}

export function addLocalMonths(dateString: string, amount: number): string {
  const date = parseLocalDate(dateString);
  return formatLocalDate(new Date(date.getFullYear(), date.getMonth() + amount, 1, 12, 0, 0));
}
