const CYCLES = { physical: 23, emotional: 28, intellectual: 33 };
const MS_PER_DAY = 86400000;

function wave(birthDate, targetDate, period) {
  if (!birthDate) return 0;
  const days = Math.floor((targetDate - new Date(birthDate)) / MS_PER_DAY);
  return Math.sin((2 * Math.PI * days) / period);
}

export function getWaves(birthDate, targetDate = new Date()) {
  return {
    physical: wave(birthDate, targetDate, CYCLES.physical),
    emotional: wave(birthDate, targetDate, CYCLES.emotional),
    intellectual: wave(birthDate, targetDate, CYCLES.intellectual),
  };
}

export function getResonance(birthDate1, birthDate2, targetDate = new Date()) {
  if (!birthDate1 || !birthDate2) return null;
  const a = getWaves(birthDate1, targetDate);
  const b = getWaves(birthDate2, targetDate);
  const diff =
    (Math.abs(a.physical - b.physical) +
      Math.abs(a.emotional - b.emotional) +
      Math.abs(a.intellectual - b.intellectual)) / 3;
  return Math.round((1 - diff / 2) * 100);
}

export function getResonanceCalendar(birthDate1, birthDate2, days = 30) {
  if (!birthDate1 || !birthDate2) return [];
  const result = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const resonance = getResonance(birthDate1, birthDate2, date);
    let rating = 'neutral';
    if (resonance >= 70) rating = 'good';
    else if (resonance < 40) rating = 'bad';
    result.push({ date, resonance, rating });
  }
  return result;
}


export function getBestDay(calendar) {
  if (!calendar || calendar.length === 0) return null;
  return calendar.reduce((best, cur) =>
    cur.resonance > best.resonance ? cur : best, calendar[0]);
}