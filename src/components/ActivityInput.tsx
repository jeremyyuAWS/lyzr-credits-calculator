import React from 'react';
import { CreditActivity } from '../types';
import { CREDIT_RATES, LLM_DEPENDENT_ACTIVITIES, TIER_MULTIPLIERS } from '../data/creditRates';
import { Info } from 'lucide-react';

interface ActivityInputProps {
  activity: CreditActivity;
  count: number;
  reasoningTier: string;
  onChange: (activity: CreditActivity, count: number) => void;
}

const ActivityInput: React.FC<ActivityInputProps> = ({ 
  activity, 
  count, 
  reasoningTier, 
  onChange 
}) => {
  const { baseCredits, description } = CREDIT_RATES[activity];
  const isLlmDependent = LLM_DEPENDENT_ACTIVITIES.includes(activity);
  const multiplier = isLlmDependent ? TIER_MULTIPLIERS[reasoningTier as keyof typeof TIER_MULTIPLIERS] : 1;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    onChange(activity, value);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    onChange(activity, value);
  };

  // Format the activity name for display
  const formatActivityName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="p-3 rounded-lg border border-gray-200 bg-white mb-2 hover:shadow-sm transition-shadow duration-200">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <span className="font-medium">{formatActivityName(activity)}</span>
          <div className="relative group ml-2">
            <Info size={16} className="text-gray-400 cursor-help" />
            <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 rounded bg-gray-800 text-white text-xs w-56 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-normal">
              {description}
              {isLlmDependent && (
                <div className="mt-1 font-semibold">
                  Affected by reasoning tier (currently {multiplier}×)
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Base: {baseCredits} credit{baseCredits !== 1 ? 's' : ''}</span>
          {isLlmDependent && (
            <span className={`ml-2 font-medium ${
              multiplier === 1 ? 'text-emerald-600' : 
              multiplier === 8 ? 'text-blue-600' : 
              'text-purple-600'
            }`}>
              × {multiplier}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center flex-1">
          <input
            type="range"
            min="0"
            max="20"
            value={count || 0}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
        <div className="flex items-center">
          <button
            type="button"
            className="px-2 py-1 border border-gray-300 rounded-l text-gray-600 hover:bg-gray-100"
            onClick={() => {
              if (count > 0) onChange(activity, count - 1);
            }}
          >
            -
          </button>
          <input
            type="number"
            min="0"
            value={count || ''}
            onChange={handleChange}
            className="w-16 p-1 border-t border-b border-gray-300 text-center bg-white"
          />
          <button
            type="button"
            className="px-2 py-1 border border-gray-300 rounded-r text-gray-600 hover:bg-gray-100"
            onClick={() => onChange(activity, count + 1)}
          >
            +
          </button>
        </div>
        <div className="text-gray-700 text-sm">
          <span className="font-medium">
            {count * baseCredits * multiplier} credits
          </span>
          {count > 0 && (
            <span className="text-xs ml-2 text-gray-500">
              ({count} × {baseCredits} {isLlmDependent ? `× ${multiplier}` : ''})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityInput;