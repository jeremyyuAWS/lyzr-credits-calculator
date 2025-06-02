import React, { useState } from 'react';
import { CreditActivity, ReasoningTier, Workload } from '../types';
import { CREDIT_RATES } from '../data/creditRates';
import TierSelector from './TierSelector';
import WorkloadForm from './WorkloadForm';
import CreditSummary from './CreditSummary';
import QualifyingQuestions from './QualifyingQuestions';
import { calculateCredits } from '../utils/calculationUtils';
import { ArrowLeft, HelpCircle } from 'lucide-react';

interface CalculatorProps {
  onOpenInfo: () => void;
  adminMode?: boolean;
  renderSummary?: (props: {
    result: any;
    workloadName: string;
    reasoningTier: ReasoningTier;
    iterations: number;
    workload: Workload;
  }) => React.ReactNode;
}

const Calculator: React.FC<CalculatorProps> = ({ 
  onOpenInfo, 
  adminMode = false,
  renderSummary
}) => {
  const [step, setStep] = useState<'questions' | 'calculator'>(adminMode ? 'calculator' : 'questions');
  const [workloadName, setWorkloadName] = useState('My Lyzr Workload');

  // Initialize workload with default values
  const [workload, setWorkload] = useState<Workload>({
    activities: Object.keys(CREDIT_RATES).reduce((acc, key) => {
      acc[key as CreditActivity] = 0;
      return acc;
    }, {} as Record<CreditActivity, number>),
    iterations: 1,
    reasoningTier: 'medium_reasoning'
  });

  const calculationResult = calculateCredits(workload);

  const handleReasoningTierChange = (tier: ReasoningTier) => {
    setWorkload(prev => ({
      ...prev,
      reasoningTier: tier
    }));
  };

  const handleWorkloadChange = (updatedWorkload: Workload) => {
    setWorkload(updatedWorkload);
  };

  const summaryProps = {
    result: calculationResult,
    workloadName,
    reasoningTier: workload.reasoningTier,
    iterations: workload.iterations,
    workload
  };

  return (
    <div className="max-w-5xl mx-auto">
      {!adminMode && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {step === 'questions' ? 'Workload Information' : 'Credits Calculator'}
          </h2>
          
          <button
            onClick={onOpenInfo}
            className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            <HelpCircle size={16} />
            <span>How it works</span>
          </button>
        </div>
      )}
      
      {step === 'questions' ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <QualifyingQuestions 
            onComplete={() => setStep('calculator')}
            onWorkloadNameChange={setWorkloadName}
            workloadName={workloadName}
          />
        </div>
      ) : (
        <>
          {!adminMode && (
            <div className="mb-4">
              <button
                onClick={() => setStep('questions')}
                className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
              >
                <ArrowLeft size={16} className="mr-1" />
                <span>Back to Workload Information</span>
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <TierSelector
                  selectedTier={workload.reasoningTier}
                  onChange={handleReasoningTierChange}
                />
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <WorkloadForm
                  workload={workload}
                  onChange={handleWorkloadChange}
                />
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                {renderSummary ? (
                  renderSummary(summaryProps)
                ) : (
                  <CreditSummary {...summaryProps} />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Calculator;