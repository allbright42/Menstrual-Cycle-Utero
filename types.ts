
export interface Cycle {
  id: string;
  startDate: string;
  endDate: string;
}

export type Symptom = 'Cramps' | 'Headache' | 'Bloating' | 'Fatigue' | 'Mood Swings' | 'Cravings' | 'Acne' | 'Tender Breasts';

export type DailyLog = {
  symptoms: Symptom[];
};

export type Logs = Record<string, DailyLog>;

export enum DayType {
  Past = 'PAST',
  Future = 'FUTURE',
  Period = 'PERIOD',
  Fertile = 'FERTILE',
  Ovulation = 'OVULATION',
  Today = 'TODAY',
}

export interface CycleDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  type: DayType;
  log?: DailyLog;
}

export interface CyclePrediction {
  averageCycleLength: number;
  averagePeriodLength: number;
  predictedPeriod: Date[];
  fertileWindow: Date[];
  ovulationDay: Date | null;
  currentPhase: { name: string; description: string };
  dayOfCycle: number | null;
}
