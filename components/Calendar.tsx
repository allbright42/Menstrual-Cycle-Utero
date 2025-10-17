
import React from 'react';
import { CycleDay, DayType } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  days: CycleDay[];
  onDayClick: (date: Date) => void;
  selectedDate: Date;
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DayCell: React.FC<{ day: CycleDay; onDayClick: (date: Date) => void; isSelected: boolean }> = ({ day, onDayClick, isSelected }) => {
  const getDayStyles = () => {
    let styles = 'w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 text-sm ';
    
    if (!day.isCurrentMonth) {
      styles += 'text-gray-300 ';
    } else {
      styles += 'text-gray-700 ';
    }

    if (day.type === DayType.Period) {
      styles += 'bg-rose-200 text-rose-800 ';
    } else if (day.type === DayType.Fertile) {
      styles += 'bg-teal-100 text-teal-800 ';
    } else if (day.type === DayType.Ovulation) {
      styles += 'bg-teal-300 font-bold text-teal-900 ring-2 ring-teal-400 ';
    } else {
      styles += 'hover:bg-pink-100 ';
    }

    if (isSelected) {
        styles += 'ring-2 ring-indigo-400 font-bold ';
    } else if (day.isToday) {
        styles += 'bg-indigo-200 text-indigo-800 font-bold ';
    }

    return styles;
  };
  
  return (
    <div className="flex justify-center items-center">
        <button onClick={() => onDayClick(day.date)} className={getDayStyles()}>
        {day.dayOfMonth}
        </button>
    </div>
  );
};

export const Calendar: React.FC<CalendarProps> = ({ currentDate, onDateChange, days, onDayClick, selectedDate }) => {
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    onDateChange(newDate);
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-2">
        {WEEK_DAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 uppercase">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <DayCell key={index} day={day} onDayClick={onDayClick} isSelected={day.date.toDateString() === selectedDate.toDateString()} />
        ))}
      </div>
       <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-200"></div>Period</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-teal-100"></div>Fertile Window</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-teal-300"></div>Ovulation</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-200"></div>Today</div>
        </div>
    </div>
  );
};
