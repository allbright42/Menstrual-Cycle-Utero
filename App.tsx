
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar } from './components/Calendar';
import { InfoPanel } from './components/InfoPanel';
import { XMarkIcon } from './components/Icons';
import { Cycle, Logs, CycleDay, DayType, Symptom } from './types';
import { calculatePredictions, startOfDay, addDays } from './utils/cycleCalculator';

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [key, state]);

  return [state, setState];
};

const LogPeriodModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (startDate: string, endDate: string) => void;
  cycles: Cycle[];
}> = ({ isOpen, onClose, onSave, cycles }) => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [error, setError] = useState('');

    useEffect(() => {
        if(cycles.length > 0) {
            const lastCycle = cycles[cycles.length - 1];
            setStartDate(lastCycle.startDate);
            setEndDate(lastCycle.endDate);
        } else {
            setStartDate(today);
            setEndDate(today);
        }
    }, [isOpen, cycles]);


    const handleSave = () => {
        if (!startDate || !endDate) {
            setError('Please select both a start and end date.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setError('Start date cannot be after the end date.');
            return;
        }
        setError('');
        onSave(startDate, endDate);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl p-8 m-4 max-w-sm w-full animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Log Your Period</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [cycles, setCycles] = usePersistentState<Cycle[]>('utero-cycles', []);
  const [logs, setLogs] = usePersistentState<Logs>('utero-logs', {});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const prediction = useMemo(() => calculatePredictions(cycles), [cycles]);

  const generateCalendarDays = useCallback((date: Date): CycleDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const days: CycleDay[] = [];
    
    for (let i = 0; i < 42; i++) {
      const currentDay = startOfDay(addDays(startDate, i));
      const today = startOfDay(new Date());

      let type: DayType = currentDay < today ? DayType.Past : DayType.Future;

      const inPeriod = cycles.some(c => 
        currentDay >= startOfDay(new Date(c.startDate)) && currentDay <= startOfDay(new Date(c.endDate))
      );
      if (inPeriod) type = DayType.Period;

      const isFertile = prediction.fertileWindow.some(d => startOfDay(d).getTime() === currentDay.getTime());
      if (isFertile) type = DayType.Fertile;
      
      const isOvulation = prediction.ovulationDay && startOfDay(prediction.ovulationDay).getTime() === currentDay.getTime();
      if (isOvulation) type = DayType.Ovulation;
      
      const isPredictedPeriod = prediction.predictedPeriod.some(d => startOfDay(d).getTime() === currentDay.getTime());
      if (isPredictedPeriod && !inPeriod) type = DayType.Period;


      days.push({
        date: currentDay,
        dayOfMonth: currentDay.getDate(),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.getTime() === today.getTime(),
        type: type,
        log: logs[currentDay.toISOString().split('T')[0]]
      });
    }

    return days;
  }, [cycles, prediction, logs]);

  const calendarDays = useMemo(() => generateCalendarDays(currentDate), [currentDate, generateCalendarDays]);
  
  const handleToggleSymptom = (symptom: Symptom) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    setLogs(prevLogs => {
      const newLogs = { ...prevLogs };
      const dayLog = newLogs[dateKey] || { symptoms: [] };
      const symptomIndex = dayLog.symptoms.indexOf(symptom);

      if (symptomIndex > -1) {
        dayLog.symptoms.splice(symptomIndex, 1);
      } else {
        dayLog.symptoms.push(symptom);
      }
      
      newLogs[dateKey] = dayLog;
      return newLogs;
    });
  };

  const handleSavePeriod = (startDateStr: string, endDateStr: string) => {
    setCycles(prevCycles => {
        // Simple approach: replace the last cycle if dates overlap or are close, otherwise add a new one.
        // A more robust solution would involve merging, splitting, or validation against all cycles.
        const newCycle: Cycle = { id: Date.now().toString(), startDate: startDateStr, endDate: endDateStr };
        const sortedCycles = [...prevCycles].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        
        if (sortedCycles.length > 0) {
            const lastCycle = sortedCycles[sortedCycles.length-1];
            // If the new start date is before or same as the last cycle's end date, we assume it's an edit of the last one.
            if(new Date(startDateStr) <= new Date(lastCycle.endDate)) {
                sortedCycles[sortedCycles.length-1] = newCycle;
                return sortedCycles;
            }
        }
        
        return [...prevCycles, newCycle].sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    });
    setIsModalOpen(false);
  };

  return (
    <>
        <header className="p-6 text-center">
            <h1 className="text-4xl font-bold text-rose-800 tracking-tight">
                Utero
            </h1>
            <p className="text-rose-500">Your personal cycle companion.</p>
        </header>
        <main className="container mx-auto p-4 flex flex-col lg:flex-row gap-8 items-start justify-center">
            <InfoPanel
              prediction={prediction}
              selectedDate={selectedDate}
              selectedDateLog={logs[selectedDate.toISOString().split('T')[0]]}
              onToggleSymptom={handleToggleSymptom}
              onLogPeriod={() => setIsModalOpen(true)}
              cyclesExist={cycles.length > 0}
            />
            <Calendar
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              days={calendarDays}
              onDayClick={setSelectedDate}
              selectedDate={selectedDate}
            />
        </main>
        <LogPeriodModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSavePeriod}
            cycles={cycles}
        />
        <style>{`
            @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
                animation: fade-in-up 0.3s ease-out forwards;
            }
        `}</style>
    </>
  );
};

export default App;
