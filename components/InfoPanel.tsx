import React from 'react';
import { CyclePrediction, Symptom, DailyLog } from '../types';
// FIX: Import `PlusIcon` which is used in the "Log Period" button.
import { SparklesIcon, CalendarDaysIcon, TagIcon, DropletIcon, PlusIcon } from './Icons';

const AVAILABLE_SYMPTOMS: Symptom[] = [
  'Cramps', 'Headache', 'Bloating', 'Fatigue', 'Mood Swings', 'Cravings', 'Acne', 'Tender Breasts'
];

interface InfoPanelProps {
  prediction: CyclePrediction;
  selectedDate: Date;
  selectedDateLog: DailyLog | undefined;
  onToggleSymptom: (symptom: Symptom) => void;
  onLogPeriod: () => void;
  cyclesExist: boolean;
}

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
  <div className={`flex items-center p-4 rounded-xl bg-opacity-20 ${color}`}>
    <div className="mr-4 text-white p-2 bg-white bg-opacity-30 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-white text-opacity-80">{title}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  </div>
);

export const InfoPanel: React.FC<InfoPanelProps> = ({ prediction, selectedDate, selectedDateLog, onToggleSymptom, onLogPeriod, cyclesExist }) => {
  
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-md flex flex-col gap-6">
      
      {/* Cycle Insights Section */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-1">Today's Phase</h2>
        <p className="font-semibold text-lg mb-3 text-purple-200">{prediction.currentPhase.name}</p>
        <p className="text-sm text-purple-100 mb-6 h-10">{prediction.currentPhase.description}</p>
        
        <div className="grid grid-cols-2 gap-3">
          <InfoCard icon={<CalendarDaysIcon className="w-5 h-5" />} title="Cycle Day" value={prediction.dayOfCycle ? `Day ${prediction.dayOfCycle}` : '-'} color="bg-purple-400" />
          <InfoCard icon={<DropletIcon className="w-5 h-5" />} title="Period Length" value={`${prediction.averagePeriodLength} Days`} color="bg-purple-400" />
          <InfoCard icon={<SparklesIcon className="w-5 h-5" />} title="Next Period" value={prediction.predictedPeriod.length > 0 ? prediction.predictedPeriod[0].toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : 'N/A'} color="bg-indigo-400" />
          <InfoCard icon={<CalendarDaysIcon className="w-5 h-5" />} title="Cycle Length" value={`${prediction.averageCycleLength} Days`} color="bg-indigo-400" />
        </div>
      </div>
      
      {/* Log Period Button */}
      <div>
        <button onClick={onLogPeriod} className="w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-rose-600 transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg shadow-rose-200">
          <PlusIcon className="w-5 h-5" />
          <span>{cyclesExist ? 'Log or Edit Period' : 'Log First Period'}</span>
        </button>
      </div>

      {/* Symptom Tracker Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-gray-500" />
            Log Symptoms
        </h3>
        <p className="text-sm text-gray-500 mb-4">For {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SYMPTOMS.map(symptom => {
            const isSelected = selectedDateLog?.symptoms.includes(symptom);
            return (
              <button 
                key={symptom} 
                onClick={() => onToggleSymptom(symptom)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                  isSelected 
                  ? 'bg-indigo-500 border-indigo-500 text-white font-semibold' 
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400'
                }`}
              >
                {symptom}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
};