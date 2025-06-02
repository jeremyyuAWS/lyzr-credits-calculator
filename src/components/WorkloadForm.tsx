import React, { useState } from 'react';
import { CreditActivity, Workload } from '../types';
import { CREDIT_RATES } from '../data/creditRates';
import ActivityInput from './ActivityInput';
import { COMMON_USE_CASES } from '../data/questionBank';
import { HelpCircle, Settings, Send } from 'lucide-react';
import VerificationModal from './VerificationModal';

interface WorkloadFormProps {
  workload: Workload;
  onChange: (workload: Workload) => void;
}

const WorkloadForm: React.FC<WorkloadFormProps> = ({ workload, onChange }) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleActivityChange = (activity: CreditActivity, count: number) => {
    onChange({
      ...workload,
      activities: {
        ...workload.activities,
        [activity]: count
      }
    });
  };

  const handleIterationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iterations = parseInt(e.target.value) || 1;
    onChange({
      ...workload,
      iterations
    });
  };

  const handleUseCaseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const useCase = e.target.value;
    if (!useCase) return;

    const selectedUseCase = COMMON_USE_CASES.find(uc => uc.name === useCase);
    if (!selectedUseCase) return;

    // Create a complete activities object with all activities
    const activities = { ...workload.activities };
    
    // Reset all activities to 0
    Object.keys(CREDIT_RATES).forEach(key => {
      activities[key as CreditActivity] = 0;
    });
    
    // Set the default activities from the use case
    Object.entries(selectedUseCase.defaultActivities).forEach(([key, value]) => {
      activities[key as CreditActivity] = value;
    });

    onChange({
      ...workload,
      activities,
      reasoningTier: selectedUseCase.suggestedTier
    });
  };

  // Group activities into categories for better organization
  const activityGroups = {
    "LLM Operations": ['llm_call', 'reflection_cycle', 'groundedness_check', 'context_relevance_check'],
    "Data & Memory": ['rag_ingest', 'rag_query', 'data_query', 'memory_short_io', 'memory_long_io'],
    "Workflows & Tools": ['filters', 'tool_call', 'dag_workflow', 'managerial_workflow']
  };

  const toggleGroup = (groupName: string) => {
    if (expandedGroup === groupName) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(groupName);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center mb-3">
          <Settings size={18} className="text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium">Common Use Cases</h3>
          <div className="relative group ml-2">
            <HelpCircle size={16} className="text-gray-400 cursor-help" />
            <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 rounded bg-gray-800 text-white text-xs w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Select a common use case to quickly populate activity counts with typical values
            </div>
          </div>
        </div>
        <select 
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors"
          onChange={handleUseCaseSelect}
          value=""
        >
          <option value="">Select a common use case (optional)</option>
          {COMMON_USE_CASES.map(useCase => (
            <option key={useCase.name} value={useCase.name}>
              {useCase.name} - {useCase.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center mb-3">
          <h3 className="text-lg font-medium">Iterations</h3>
          <div className="relative group ml-2">
            <HelpCircle size={16} className="text-gray-400 cursor-help" />
            <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 rounded bg-gray-800 text-white text-xs w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              The number of times this workload will run. For example, if you're generating 10 blog posts, set this to 10.
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="100"
              value={workload.iterations}
              onChange={(e) => handleIterationsChange(e)}
              className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <input
              type="number"
              min="1"
              value={workload.iterations}
              onChange={handleIterationsChange}
              className="w-20 p-2 border border-gray-300 rounded text-center"
            />
          </div>
          <div className="text-sm text-gray-600">
            Total number of times this workload will run
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center mb-3">
          <h3 className="text-lg font-medium">Activities</h3>
          <div className="relative group ml-2">
            <HelpCircle size={16} className="text-gray-400 cursor-help" />
            <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 rounded bg-gray-800 text-white text-xs w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Enter the count for each activity that will occur in a single iteration of your workload
            </div>
          </div>
        </div>
        
        {Object.entries(activityGroups).map(([groupName, activities]) => {
          const isExpanded = expandedGroup === groupName;
          const hasActiveActivities = activities.some(
            activity => workload.activities[activity as CreditActivity] > 0
          );
          
          return (
            <div key={groupName} className="mb-4 border rounded-lg overflow-hidden">
              <div 
                className={`p-3 flex justify-between items-center cursor-pointer ${hasActiveActivities ? 'bg-indigo-50' : 'bg-gray-50'}`}
                onClick={() => toggleGroup(groupName)}
              >
                <h4 className="font-medium text-gray-700">
                  {groupName}
                  {hasActiveActivities && (
                    <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </h4>
                <div className="text-gray-500 text-sm">
                  {isExpanded ? '▼' : '▶'}
                </div>
              </div>
              
              <div className={`transition-all duration-300 ${isExpanded ? 'max-h-screen p-3' : 'max-h-0 overflow-hidden'}`}>
                {activities.map((activity) => (
                  <ActivityInput
                    key={activity}
                    activity={activity as CreditActivity}
                    count={workload.activities[activity as CreditActivity]}
                    reasoningTier={workload.reasoningTier}
                    onChange={handleActivityChange}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setShowVerificationModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors duration-200"
        >
          <Send size={16} />
          <span>Verify with Lyzr API</span>
        </button>
      </div>

      {showVerificationModal && (
        <VerificationModal
          workload={workload}
          onClose={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  );
};

export default WorkloadForm;