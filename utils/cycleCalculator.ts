
import { Cycle, CyclePrediction } from '../types';

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

// Helper to get the difference in days between two dates
export const differenceInDays = (d1: Date, d2: Date): number => {
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const calculatePredictions = (cycles: Cycle[]): CyclePrediction => {
  if (cycles.length === 0) {
    return {
      averageCycleLength: DEFAULT_CYCLE_LENGTH,
      averagePeriodLength: DEFAULT_PERIOD_LENGTH,
      predictedPeriod: [],
      fertileWindow: [],
      ovulationDay: null,
      currentPhase: { name: 'No Data', description: 'Log your first period to get started.' },
      dayOfCycle: null,
    };
  }

  // Sort cycles by start date
  const sortedCycles = [...cycles].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  let totalCycleLength = 0;
  for (let i = 0; i < sortedCycles.length - 1; i++) {
    const start1 = new Date(sortedCycles[i].startDate);
    const start2 = new Date(sortedCycles[i + 1].startDate);
    totalCycleLength += differenceInDays(start1, start2);
  }
  const averageCycleLength = sortedCycles.length > 1 ? Math.round(totalCycleLength / (sortedCycles.length - 1)) : DEFAULT_CYCLE_LENGTH;

  let totalPeriodLength = 0;
  sortedCycles.forEach(cycle => {
    totalPeriodLength += differenceInDays(new Date(cycle.startDate), new Date(cycle.endDate)) + 1;
  });
  const averagePeriodLength = Math.round(totalPeriodLength / sortedCycles.length);

  const lastCycle = sortedCycles[sortedCycles.length - 1];
  const lastPeriodStartDate = new Date(lastCycle.startDate);
  
  const nextPeriodStartDate = addDays(lastPeriodStartDate, averageCycleLength);
  const predictedPeriod: Date[] = [];
  for (let i = 0; i < averagePeriodLength; i++) {
    predictedPeriod.push(addDays(nextPeriodStartDate, i));
  }

  const ovulationDay = addDays(nextPeriodStartDate, -14);
  const fertileWindow: Date[] = [];
  for (let i = -5; i <= 0; i++) {
    fertileWindow.push(addDays(ovulationDay, i));
  }

  const today = startOfDay(new Date());
  const dayOfCycle = differenceInDays(startOfDay(lastPeriodStartDate), today) + 1;

  let currentPhase = { name: 'Follicular Phase', description: 'Your body is preparing for ovulation. Estrogen levels rise.' };
  if (fertileWindow.some(d => d.getTime() === today.getTime())) {
    currentPhase = { name: 'Fertile Window', description: 'The best time to conceive. You may feel more energetic.' };
  }
  if (ovulationDay && ovulationDay.getTime() === today.getTime()) {
    currentPhase = { name: 'Ovulation', description: 'Your ovary releases an egg. Peak fertility.' };
  }
  const lutealStartDate = addDays(ovulationDay, 1);
  if (today >= lutealStartDate && today < nextPeriodStartDate) {
    currentPhase = { name: 'Luteal Phase', description: 'Progesterone levels rise. You might experience PMS symptoms.' };
  }

  const isTodayInPeriod = sortedCycles.some(cycle => {
    const start = startOfDay(new Date(cycle.startDate));
    const end = startOfDay(new Date(cycle.endDate));
    return today >= start && today <= end;
  });

  if (isTodayInPeriod) {
    currentPhase = { name: 'Menstruation', description: 'Your period. The uterine lining is shedding. Rest and take it easy.' };
  }


  return {
    averageCycleLength,
    averagePeriodLength,
    predictedPeriod,
    fertileWindow,
    ovulationDay,
    currentPhase,
    dayOfCycle
  };
};
