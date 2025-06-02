import React from 'react';
import { ReasoningTier } from '../types';
import { TIER_DESCRIPTIONS, TIER_MULTIPLIERS } from '../data/creditRates';
import { Brain, Cpu, HelpCircle, Lightbulb } from 'lucide-react';

interface TierSelectorProps {
  selectedTier: ReasoningTier;
  onChange: (tier: ReasoningTier) => void;
}

const TierSelector: React.FC<TierSelectorProps> = ({ selectedTier, onChange }) => {
  const tiers: { 
    id: ReasoningTier; 
    name: string; 
    icon: React.ReactNode; 
    color: string;
    hoverColor: string;
    description: string;
  }[] = [
    { 
      id: 'base_model', 
      name: 'Base Model', 
      icon: <Lightbulb size={24} />,
      color: 'bg-emerald-100 border-emerald-200 text-emerald-800',
      hoverColor: 'hover:bg-emerald-200 hover:border-emerald-300',
      description: 'Fast, cost-efficient for light reasoning tasks and simple Q&A'
    },
    { 
      id: 'medium_reasoning', 
      name: 'Medium Reasoning', 
      icon: <Cpu size={24} />, 
      color: 'bg-blue-100 border-blue-200 text-blue-800',
      hoverColor: 'hover:bg-blue-200 hover:border-blue-300',
      description: 'Balanced performance for structured, analytical use cases'
    },
    { 
      id: 'heavy_reasoning', 
      name: 'Heavy Reasoning', 
      icon: <Brain size={24} />, 
      color: 'bg-purple-100 border-purple-200 text-purple-800',
      hoverColor: 'hover:bg-purple-200 hover:border-purple-300',
      description: 'High-performance for complex, multi-step expert-level tasks'
    }
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center mb-3">
        <h3 className="text-lg font-medium">Select Reasoning Tier</h3>
        <div className="relative group ml-2">
          <HelpCircle size={16} className="text-gray-400 cursor-help" />
          <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 rounded bg-gray-800 text-white text-xs w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            The reasoning tier determines the complexity of LLM operations. Higher tiers provide more sophisticated reasoning but cost more credits.
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier) => {
          const isSelected = tier.id === selectedTier;
          return (
            <div
              key={tier.id}
              onClick={() => onChange(tier.id)}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${tier.color} ${tier.hoverColor}
                ${isSelected ? 'ring-2 ring-offset-2 ring-indigo-500 border-transparent' : ''}
              `}
            >
              <div className="flex items-center mb-2">
                <div className="mr-2">{tier.icon}</div>
                <h4 className="font-semibold">{tier.name}</h4>
              </div>
              <div className="text-sm mb-2">{tier.description}</div>
              <div className="flex justify-between items-center">
                <div className="text-xs font-medium">
                  Multiplier: {TIER_MULTIPLIERS[tier.id]}×
                </div>
                {isSelected && (
                  <div className="bg-white bg-opacity-50 px-2 py-1 rounded-full text-xs font-medium">
                    Selected
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TierSelector;