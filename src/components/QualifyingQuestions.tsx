import React, { useState } from 'react';
import { QualifyingQuestion } from '../types';
import { QUALIFYING_QUESTIONS } from '../data/questionBank';
import { ChevronRight, HelpCircle, Sliders } from 'lucide-react';

interface QualifyingQuestionsProps {
  onComplete: () => void;
  onWorkloadNameChange: (name: string) => void;
  workloadName: string;
}

const QualifyingQuestions: React.FC<QualifyingQuestionsProps> = ({ 
  onComplete, 
  onWorkloadNameChange,
  workloadName
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [description, setDescription] = useState('');
  
  // Filter questions based on dependencies
  const visibleQuestions = QUALIFYING_QUESTIONS.filter(question => {
    if (!question.dependsOn) return true;
    
    // Check if all dependent questions have answers
    return question.dependsOn.every(dependency => answers[dependency]);
  });
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleContinue = () => {
    onComplete();
  };
  
  // Check if user has answered at least two questions
  const hasMinimumAnswers = Object.keys(answers).length >= 2;

  // Helper function to render the appropriate input type based on question id
  const renderQuestionInput = (question: QualifyingQuestion) => {
    switch (question.id) {
      case 'usage_frequency':
        return (
          <select
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors"
          >
            <option value="">Select frequency...</option>
            <option value="on-demand">On-demand (manual trigger)</option>
            <option value="daily">Daily (1-2 times per day)</option>
            <option value="hourly">Hourly (several times per day)</option>
            <option value="continuous">Continuous (always running)</option>
            <option value="weekly">Weekly (few times per week)</option>
            <option value="monthly">Monthly (few times per month)</option>
          </select>
        );
      
      case 'complexity':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Simple</span>
              <span className="text-sm">Complex</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={answers[question.id] || '3'}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Basic Q&A</span>
              <span className="text-xs text-gray-500">Simple Analysis</span>
              <span className="text-xs text-gray-500">Multi-step Reasoning</span>
              <span className="text-xs text-gray-500">Complex Problem Solving</span>
              <span className="text-xs text-gray-500">Expert Tasks</span>
            </div>
            <div className="mt-2 text-center font-medium">
              {
                !answers[question.id] ? 'Select complexity level' :
                parseInt(answers[question.id]) === 1 ? 'Simple Q&A' :
                parseInt(answers[question.id]) === 2 ? 'Basic Analysis' :
                parseInt(answers[question.id]) === 3 ? 'Multi-step Reasoning' :
                parseInt(answers[question.id]) === 4 ? 'Complex Problem Solving' :
                'Expert-level Tasks'
              }
            </div>
          </div>
        );
      
      case 'steps':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Few</span>
              <span className="text-sm">Many</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={answers[question.id] || '3'}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="mt-2 text-center font-medium">
              {answers[question.id] ? `${answers[question.id]} steps` : 'Select number of steps'}
            </div>
          </div>
        );
      
      case 'external_calls':
        return (
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-indigo-600"
                name="external_calls"
                value="yes"
                checked={answers[question.id] === 'yes'}
                onChange={() => handleAnswerChange(question.id, 'yes')}
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-indigo-600"
                name="external_calls"
                value="no"
                checked={answers[question.id] === 'no'}
                onChange={() => handleAnswerChange(question.id, 'no')}
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        );
      
      case 'data_sources':
        return (
          <div className="flex items-center">
            <button
              type="button"
              className="px-3 py-1 border border-gray-300 rounded-l"
              onClick={() => {
                const currentVal = parseInt(answers[question.id] || '0');
                if (currentVal > 0) {
                  handleAnswerChange(question.id, (currentVal - 1).toString());
                }
              }}
            >
              -
            </button>
            <input
              type="number"
              min="0"
              value={answers[question.id] || '0'}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-16 text-center p-1 border-t border-b border-gray-300"
            />
            <button
              type="button"
              className="px-3 py-1 border border-gray-300 rounded-r"
              onClick={() => {
                const currentVal = parseInt(answers[question.id] || '0');
                handleAnswerChange(question.id, (currentVal + 1).toString());
              }}
            >
              +
            </button>
            <span className="ml-2 text-gray-600">data sources</span>
          </div>
        );
      
      case 'safety_filters':
        return (
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-indigo-600"
                name="safety_filters"
                value="yes"
                checked={answers[question.id] === 'yes'}
                onChange={() => handleAnswerChange(question.id, 'yes')}
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-indigo-600"
                name="safety_filters"
                value="no"
                checked={answers[question.id] === 'no'}
                onChange={() => handleAnswerChange(question.id, 'no')}
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        );
      
      case 'input_size':
        return (
          <select
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors"
          >
            <option value="">Select input size...</option>
            <option value="small">Small (few sentences, &lt; 1k tokens)</option>
            <option value="medium">Medium (paragraphs, 1k-5k tokens)</option>
            <option value="large">Large (documents, 5k-10k tokens)</option>
            <option value="very_large">Very Large (multiple documents, &gt; 10k tokens)</option>
          </select>
        );
      
      case 'memory_requirements':
        return (
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="short-term-memory"
                checked={answers[question.id]?.includes('short_term') || false}
                onChange={(e) => {
                  const current = answers[question.id] ? answers[question.id].split(',') : [];
                  if (e.target.checked) {
                    current.push('short_term');
                  } else {
                    const index = current.indexOf('short_term');
                    if (index > -1) current.splice(index, 1);
                  }
                  handleAnswerChange(question.id, current.join(','));
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="short-term-memory" className="ml-2 text-sm text-gray-700">
                Short-term memory (conversation history)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="long-term-memory"
                checked={answers[question.id]?.includes('long_term') || false}
                onChange={(e) => {
                  const current = answers[question.id] ? answers[question.id].split(',') : [];
                  if (e.target.checked) {
                    current.push('long_term');
                  } else {
                    const index = current.indexOf('long_term');
                    if (index > -1) current.splice(index, 1);
                  }
                  handleAnswerChange(question.id, current.join(','));
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="long-term-memory" className="ml-2 text-sm text-gray-700">
                Long-term memory (persistent knowledge)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="intermediate-results"
                checked={answers[question.id]?.includes('intermediate') || false}
                onChange={(e) => {
                  const current = answers[question.id] ? answers[question.id].split(',') : [];
                  if (e.target.checked) {
                    current.push('intermediate');
                  } else {
                    const index = current.indexOf('intermediate');
                    if (index > -1) current.splice(index, 1);
                  }
                  handleAnswerChange(question.id, current.join(','));
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="intermediate-results" className="ml-2 text-sm text-gray-700">
                Store intermediate results
              </label>
            </div>
          </div>
        );
        
      default:
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded resize-none h-20"
            placeholder="Enter your answer..."
          />
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="workload-name" className="block text-sm font-medium text-gray-700 mb-1">
          Workload Name
        </label>
        <input
          type="text"
          id="workload-name"
          value={workloadName}
          onChange={(e) => onWorkloadNameChange(e.target.value)}
          placeholder="e.g., Customer Support Bot, Data Analysis Pipeline"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="workload-description" className="block text-sm font-medium text-gray-700 mb-1">
          Brief Description
        </label>
        <textarea
          id="workload-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this workload or agent will do..."
          className="w-full p-2 border border-gray-300 rounded h-24 resize-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors"
        />
      </div>
      
      <div>
        <div className="flex items-center mb-3">
          <Sliders size={18} className="text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium">Qualifying Questions</h3>
          <div className="relative group ml-2">
            <HelpCircle size={16} className="text-gray-400 cursor-help" />
            <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 rounded bg-gray-800 text-white text-xs w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              These questions help us understand your workload better to provide a more accurate estimate. Please answer at least 2 questions.
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {visibleQuestions.map((question) => (
            <div key={question.id} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors duration-200 bg-white shadow-sm">
              <label className="block text-sm font-medium mb-2">
                {question.text}
              </label>
              {renderQuestionInput(question)}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!workloadName || !hasMinimumAnswers}
          className={`
            flex items-center px-4 py-2 rounded font-medium transition-colors duration-200
            ${(!workloadName || !hasMinimumAnswers) 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'}
          `}
        >
          <span>Continue to Calculator</span>
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default QualifyingQuestions;