import React, { useState, useEffect } from 'react';
import { QualifyingQuestion } from '../types';
import { QUALIFYING_QUESTIONS } from '../data/questionBank';
import { ChevronRight, HelpCircle, Sliders, Sparkles, ArrowRight, Star, BookOpen, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QualifyingQuestionsProps {
  onComplete: () => void;
  onWorkloadNameChange: (name: string) => void;
  workloadName: string;
}

const QualifyingQuestionsInfo: Record<string, { 
  icon: React.ReactNode; 
  friendlyText: string; 
  examples: string[];
  placeholder?: string;
}> = {
  usage_frequency: {
    icon: <Zap size={18} className="text-indigo-600" />,
    friendlyText: "How often will this be used?",
    examples: ["For customer service bots: 'continuous'", "For monthly reports: 'monthly'"],
    placeholder: "Think about how frequently you'll use this..."
  },
  complexity: {
    icon: <Star size={18} className="text-indigo-600" />,
    friendlyText: "How complicated are the tasks?",
    examples: ["For simple Q&A: select level 1", "For data analysis: level 3-4"],
  },
  steps: {
    icon: <ArrowRight size={18} className="text-indigo-600" />,
    friendlyText: "How many steps to complete each task?",
    examples: ["Customer service response: 3-4 steps", "Research analysis: 7+ steps"],
  },
  external_calls: {
    icon: <BookOpen size={18} className="text-indigo-600" />,
    friendlyText: "Will it connect to other systems or websites?",
    examples: ["Checking weather from WeatherAPI: Yes", "Standalone chat: No"],
  },
  data_sources: {
    icon: <BookOpen size={18} className="text-indigo-600" />,
    friendlyText: "How many different places will data come from?",
    examples: ["Product catalog + customer database = 2", "Internal docs only = 1"],
  },
  safety_filters: {
    icon: <BookOpen size={18} className="text-indigo-600" />,
    friendlyText: "Need content filtering for safety?",
    examples: ["Customer-facing service: Yes", "Internal analyst tool: Maybe No"],
  },
  input_size: {
    icon: <BookOpen size={18} className="text-indigo-600" />,
    friendlyText: "How much text will it process at once?",
    examples: ["Short questions: Small", "Entire documents: Large"],
  },
  memory_requirements: {
    icon: <BookOpen size={18} className="text-indigo-600" />,
    friendlyText: "Does it need to remember previous interactions?",
    examples: ["Chat assistant: Short-term memory", "Knowledge base: Long-term memory"],
  }
};

const QualifyingQuestions: React.FC<QualifyingQuestionsProps> = ({ 
  onComplete, 
  onWorkloadNameChange,
  workloadName
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestionsAvailable, setSuggestionsAvailable] = useState(false);
  const [showSuggestionSuccess, setShowSuggestionSuccess] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Group questions
  const questionGroups = [
    {
      title: "Basics",
      description: "Let's start with the essential information",
      questions: QUALIFYING_QUESTIONS.filter(q => 
        ['usage_frequency', 'complexity'].includes(q.id)
      )
    },
    {
      title: "Task Structure",
      description: "Tell us about how your AI tasks will be organized",
      questions: QUALIFYING_QUESTIONS.filter(q => 
        ['steps', 'external_calls', 'data_sources'].includes(q.id)
      )
    },
    {
      title: "Data & Memory",
      description: "Information about your data and memory needs",
      questions: QUALIFYING_QUESTIONS.filter(q => 
        ['input_size', 'memory_requirements', 'safety_filters'].includes(q.id)
      )
    }
  ];
  
  const currentGroup = questionGroups[currentStepIndex];
  
  // Filter questions based on dependencies within the current group
  const visibleQuestions = currentGroup.questions.filter(question => {
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
    if (currentStepIndex < questionGroups.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };
  
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  // Check if user has answered the questions in the current group
  const hasAnsweredGroup = visibleQuestions.every(question => answers[question.id]);
  
  // Check if user has answered at least two questions overall
  const hasMinimumAnswers = Object.keys(answers).length >= 2;

  // Check if description is detailed enough to generate suggestions
  useEffect(() => {
    const hasEnoughWords = description.split(/\s+/).filter(word => word.trim().length > 0).length >= 5;
    setSuggestionsAvailable(hasEnoughWords);
  }, [description]);

  // This function uses the description to suggest answers to qualifying questions
  const generateSuggestions = () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const descriptionLower = description.toLowerCase();
      const suggestedAnswers: Record<string, string> = {};
      
      // Usage frequency
      if (descriptionLower.includes('daily') || descriptionLower.includes('every day')) {
        suggestedAnswers['usage_frequency'] = 'daily';
      } else if (descriptionLower.includes('hour') || descriptionLower.includes('frequent')) {
        suggestedAnswers['usage_frequency'] = 'hourly';
      } else if (descriptionLower.includes('week')) {
        suggestedAnswers['usage_frequency'] = 'weekly';
      } else if (descriptionLower.includes('month')) {
        suggestedAnswers['usage_frequency'] = 'monthly';
      } else if (descriptionLower.includes('continuous') || descriptionLower.includes('always')) {
        suggestedAnswers['usage_frequency'] = 'continuous';
      } else {
        suggestedAnswers['usage_frequency'] = 'on-demand';
      }
      
      // Complexity level
      if (descriptionLower.includes('complex') || descriptionLower.includes('advanced') || 
          descriptionLower.includes('expert') || descriptionLower.includes('sophisticated')) {
        suggestedAnswers['complexity'] = '5';
      } else if (descriptionLower.includes('analysis') || descriptionLower.includes('reasoning')) {
        suggestedAnswers['complexity'] = '4';
      } else if (descriptionLower.includes('multi') || descriptionLower.includes('steps')) {
        suggestedAnswers['complexity'] = '3';
      } else if (descriptionLower.includes('simple') || descriptionLower.includes('basic')) {
        suggestedAnswers['complexity'] = '1';
      } else {
        suggestedAnswers['complexity'] = '2';
      }
      
      // Number of steps
      const stepsMatch = descriptionLower.match(/(\d+)\s*(step|steps)/);
      if (stepsMatch && parseInt(stepsMatch[1]) >= 1 && parseInt(stepsMatch[1]) <= 10) {
        suggestedAnswers['steps'] = stepsMatch[1];
      } else if (descriptionLower.includes('many steps') || descriptionLower.includes('multiple steps')) {
        suggestedAnswers['steps'] = '7';
      } else if (descriptionLower.includes('few steps') || descriptionLower.includes('simple')) {
        suggestedAnswers['steps'] = '2';
      } else {
        suggestedAnswers['steps'] = '4';
      }
      
      // External calls
      if (descriptionLower.includes('api') || descriptionLower.includes('external') || 
          descriptionLower.includes('integration') || descriptionLower.includes('third party')) {
        suggestedAnswers['external_calls'] = 'yes';
      } else {
        suggestedAnswers['external_calls'] = 'no';
      }
      
      // Data sources
      const dataSourcesMatch = descriptionLower.match(/(\d+)\s*(source|sources|database|databases)/);
      if (dataSourcesMatch) {
        suggestedAnswers['data_sources'] = dataSourcesMatch[1];
      } else if (descriptionLower.includes('multiple sources') || descriptionLower.includes('databases')) {
        suggestedAnswers['data_sources'] = '3';
      } else if (descriptionLower.includes('source') || descriptionLower.includes('database')) {
        suggestedAnswers['data_sources'] = '1';
      } else {
        suggestedAnswers['data_sources'] = '0';
      }
      
      // Input size
      if (descriptionLower.includes('large document') || descriptionLower.includes('many documents') || 
          descriptionLower.includes('big file') || descriptionLower.includes('extensive')) {
        suggestedAnswers['input_size'] = 'large';
      } else if (descriptionLower.includes('very large') || descriptionLower.includes('huge')) {
        suggestedAnswers['input_size'] = 'very_large';
      } else if (descriptionLower.includes('paragraph') || descriptionLower.includes('medium')) {
        suggestedAnswers['input_size'] = 'medium';
      } else {
        suggestedAnswers['input_size'] = 'small';
      }
      
      // Memory requirements
      const memoryReqs = [];
      if (descriptionLower.includes('conversation') || descriptionLower.includes('history') || 
          descriptionLower.includes('chat') || descriptionLower.includes('remember context')) {
        memoryReqs.push('short_term');
      }
      
      if (descriptionLower.includes('persistent') || descriptionLower.includes('long term') || 
          descriptionLower.includes('store data')) {
        memoryReqs.push('long_term');
      }
      
      if (descriptionLower.includes('intermediate') || descriptionLower.includes('processing steps') || 
          descriptionLower.includes('save progress')) {
        memoryReqs.push('intermediate');
      }
      
      if (memoryReqs.length > 0) {
        suggestedAnswers['memory_requirements'] = memoryReqs.join(',');
      }
      
      // Safety filters
      if (descriptionLower.includes('filter') || descriptionLower.includes('safety') || 
          descriptionLower.includes('moderate') || descriptionLower.includes('secure') || 
          descriptionLower.includes('content moderation') || descriptionLower.includes('toxic')) {
        suggestedAnswers['safety_filters'] = 'yes';
      } else {
        suggestedAnswers['safety_filters'] = 'no';
      }
      
      // Update answers with suggestions
      setAnswers(prev => ({
        ...prev,
        ...suggestedAnswers
      }));
      
      setIsAnalyzing(false);
      setShowSuggestionSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuggestionSuccess(false);
      }, 3000);
    }, 1200); // Simulate AI processing delay
  };

  // Helper function to render the appropriate input type based on question id
  const renderQuestionInput = (question: QualifyingQuestion) => {
    const info = QualifyingQuestionsInfo[question.id] || {
      icon: <HelpCircle size={18} className="text-indigo-600" />,
      friendlyText: question.text,
      examples: []
    };

    switch (question.id) {
      case 'usage_frequency':
        return (
          <div className="space-y-3">
            <div className="flex items-center">
              {info.icon}
              <span className="ml-2 font-medium text-base">{info.friendlyText}</span>
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-indigo-800">
                This affects how many credits you'll use over time. More frequent usage means more credits.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { value: 'on-demand', label: 'Occasionally', desc: 'Manual use when needed' },
                { value: 'daily', label: 'Daily', desc: '1-2 times per day' },
                { value: 'hourly', label: 'Frequent', desc: 'Several times a day' },
                { value: 'continuous', label: 'Always On', desc: 'Running continuously' },
                { value: 'weekly', label: 'Weekly', desc: 'Few times per week' },
                { value: 'monthly', label: 'Monthly', desc: 'Few times per month' }
              ].map(option => (
                <div 
                  key={option.value}
                  onClick={() => handleAnswerChange(question.id, option.value)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    answers[question.id] === option.value 
                      ? 'bg-indigo-100 border-indigo-300 ring-2 ring-indigo-200' 
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-600">{option.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'complexity':
        return (
          <div className="space-y-3">
            <div className="flex items-center">
              {info.icon}
              <span className="ml-2 font-medium text-base">{info.friendlyText}</span>
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-indigo-800">
                The more complex the tasks, the more processing power (and credits) will be needed.
              </p>
            </div>
            
            <div className="flex flex-col space-y-4">
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
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    !answers[question.id] || parseInt(answers[question.id]) < 2 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    1
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    answers[question.id] && parseInt(answers[question.id]) === 2 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    2
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    answers[question.id] && parseInt(answers[question.id]) === 3 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    3
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    answers[question.id] && parseInt(answers[question.id]) === 4 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    4
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    answers[question.id] && parseInt(answers[question.id]) === 5 
                      ? 'bg-violet-100 text-violet-700' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    5
                  </div>
                </div>
                
                <h5 className="font-medium text-lg mb-1">
                  {
                    !answers[question.id] ? 'Select complexity level' :
                    parseInt(answers[question.id]) === 1 ? 'Simple Q&A' :
                    parseInt(answers[question.id]) === 2 ? 'Basic Analysis' :
                    parseInt(answers[question.id]) === 3 ? 'Multi-step Reasoning' :
                    parseInt(answers[question.id]) === 4 ? 'Complex Problem Solving' :
                    'Expert-level Tasks'
                  }
                </h5>
                
                <p className="text-sm text-gray-600">
                  {
                    !answers[question.id] ? 'Drag the slider to select complexity level' :
                    parseInt(answers[question.id]) === 1 ? 'Straightforward questions with direct answers like "What's the weather?" or "Who is the CEO?"' :
                    parseInt(answers[question.id]) === 2 ? 'Simple analysis tasks like summarizing text or classifying basic information.' :
                    parseInt(answers[question.id]) === 3 ? 'Tasks requiring multiple steps of thinking, like creating a plan or analyzing data trends.' :
                    parseInt(answers[question.id]) === 4 ? 'Detailed analysis requiring specialized knowledge, like legal document review or financial analysis.' :
                    'Expert-level tasks involving advanced reasoning, creative problem-solving, or specialized knowledge domains.'
                  }
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'steps':
        return (
          <div className="space-y-3">
            <div className="flex items-center">
              {info.icon}
              <span className="ml-2 font-medium text-base">{info.friendlyText}</span>
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-indigo-800">
                Think of these as the number of separate actions needed to complete a task.
              </p>
            </div>
            
            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center flex-1">
                <button
                  type="button"
                  className="px-3 py-2 border border-gray-300 rounded-l text-gray-600 hover:bg-gray-100"
                  onClick={() => {
                    const current = parseInt(answers[question.id] || '3');
                    if (current > 1) handleAnswerChange(question.id, (current - 1).toString());
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={answers[question.id] || '3'}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-16 p-1 border-t border-b border-gray-300 text-center"
                />
                <button
                  type="button"
                  className="px-3 py-2 border border-gray-300 rounded-r text-gray-600 hover:bg-gray-100"
                  onClick={() => {
                    const current = parseInt(answers[question.id] || '3');
                    if (current < 10) handleAnswerChange(question.id, (current + 1).toString());
                  }}
                >
                  +
                </button>
              </div>
              
              <div>
                <div className="font-medium">
                  {answers[question.id] ? `${answers[question.id]} steps` : '3 steps'}
                </div>
                <div className="text-xs text-gray-500">
                  {parseInt(answers[question.id] || '3') <= 3 ? 'Simple workflow' : 
                   parseInt(answers[question.id] || '3') <= 6 ? 'Moderate workflow' : 
                   'Complex workflow'}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'external_calls':
        return (
          <div className="space-y-3">
            <div className="flex items-center">
              {info.icon}
              <span className="ml-2 font-medium text-base">{info.friendlyText}</span>
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-indigo-800">
                Examples: checking the weather, looking up stock prices, or searching websites.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <div
                onClick={() => handleAnswerChange(question.id, 'yes')}
                className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[question.id] === 'yes'
                    ? 'bg-indigo-100 border-indigo-300 ring-2 ring-indigo-200'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <h5 className="font-medium mb-1">Yes</h5>
                <p className="text-sm text-gray-600">
                  Will connect to external systems or APIs
                </p>
              </div>
              
              <div
                onClick={() => handleAnswerChange(question.id, 'no')}
                className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[question.id] === 'no'
                    ? 'bg-indigo-100 border-indigo-300 ring-2 ring-indigo-200'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <h5 className="font-medium mb-1">No</h5>
                <p className="text-sm text-gray-600">
                  Won't need external connections
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'data_sources':
        return (
          <div className="space-y-3">
            <div className="flex items-center">
              {info.icon}
              <span className="ml-2 font-medium text-base">{info.friendlyText}</span>
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-indigo-800">
                Examples: databases, documents, or websites that provide information.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
              <div>
                <div className="font-medium mb-1">Number of data sources</div>
                <p className="text-sm text-gray-600">
                  {parseInt(answers[question.id] || '0') === 0 ? 'No external data sources' :
                   parseInt(answers[question.id] || '0') === 1 ? '1 data source' :
                   `${answers[question.id] || '0'} data sources`}
                </p>
              </div>
              
              <div className="flex items-center">
                <button
                  type="button"
                  className="px-3 py-2 border border-gray-300 rounded-l text-gray-600 hover:bg-gray-100"
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
                  className="px-3 py-2 border border-gray-300 rounded-r text-gray-600 hover:bg-gray-100"
                  onClick={() => {
                    const currentVal = parseInt(answers[question.id] || '0');
                    handleAnswerChange(question.id, (currentVal + 1).toString());
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'safety_filters':
        return (
          <div className="space-y-3">
            <div className="flex items-center">
              {info.icon}
              <span className="ml-2 font-medium text-base">{info.friendlyText}</span>
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-indigo-800">
                Safety filters help catch inappropriate content, harmful instructions, or unethical requests.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <div
                onClick={() => handleAnswerChange(question.id, 'yes')}
                className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[question.id] === 'yes'
                    ? 'bg-indigo-100 border-indigo-300 ring-2 ring-indigo-200'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <h5 className="font-medium mb-1">Yes</h5>
                <p className="text-sm text-gray-600">
                  Need content moderation and safety checks
                </p>
              </div>
              
              <div
                onClick={() => handleAnswerChange(question.id, 'no')}
                className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[question.id] === 'no'
                    ? 'bg-indigo-100 border-indigo-300 ring-2 ring-indigo-200'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <h5 className="font-medium mb-1">No</h5>
                <p className="text-sm text-gray-600">
                  No additional content filtering needed
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'input_size':
        return (
          <div className="space-y-3">
            <div className="flex items-center">
              {info.icon}
              <span className="ml-2 font-medium text-base">{info.friendlyText}</span>
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-indigo-800">
                This is about how much text will be processed in each interaction. Larger inputs cost more.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'small', label: 'Small', desc: 'Few sentences (< 1K tokens)', example: 'Simple questions or commands' },
                { value: 'medium', label: 'Medium', desc: 'Paragraphs (1-5K tokens)', example: 'Email or article' },
                { value: 'large', label: 'Large', desc: 'Documents (5-10K tokens)', example: 'Long report or paper' },
                { value: 'very_large', label: 'Very Large', desc: 'Multiple documents (> 10K tokens)', example: 'Book or multiple files' }
              ].map(option => (
                <div 
                  key={option.value}
                  onClick={() => handleAnswerChange(question.id, option.value)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    answers[question.id] === option.value 
                      ? 'bg-indigo-100 border-indigo-300 ring-2 ring-indigo-200' 
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-600">{option.desc}</div>
                  <div className="text-xs italic mt-1 text-gray-500">Example: {option.example}</div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'memory_requirements':
        return (
          <div className="space-y-3">
            <div className="flex items-center">
              {info.icon}
              <span className="ml-2 font-medium text-base">{info.friendlyText}</span>
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-indigo-800">
                Memory lets the AI remember previous interactions or store information.
              </p>
            </div>
            
            <div className="space-y-2 bg-white p-4 rounded-lg border border-gray-200">
              <div 
                className={`flex items-center p-3 border rounded cursor-pointer ${
                  answers[question.id]?.includes('short_term')
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => {
                  const current = answers[question.id] ? answers[question.id].split(',') : [];
                  if (current.includes('short_term')) {
                    const index = current.indexOf('short_term');
                    current.splice(index, 1);
                  } else {
                    current.push('short_term');
                  }
                  handleAnswerChange(question.id, current.join(','));
                }}
              >
                <input
                  type="checkbox"
                  checked={answers[question.id]?.includes('short_term') || false}
                  onChange={() => {}}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <h5 className="font-medium">Remember Conversations</h5>
                  <p className="text-sm text-gray-600">
                    Keeps track of back-and-forth conversations
                  </p>
                </div>
              </div>
              
              <div 
                className={`flex items-center p-3 border rounded cursor-pointer ${
                  answers[question.id]?.includes('long_term')
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => {
                  const current = answers[question.id] ? answers[question.id].split(',') : [];
                  if (current.includes('long_term')) {
                    const index = current.indexOf('long_term');
                    current.splice(index, 1);
                  } else {
                    current.push('long_term');
                  }
                  handleAnswerChange(question.id, current.join(','));
                }}
              >
                <input
                  type="checkbox"
                  checked={answers[question.id]?.includes('long_term') || false}
                  onChange={() => {}}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <h5 className="font-medium">Long-term Knowledge</h5>
                  <p className="text-sm text-gray-600">
                    Remembers information across multiple sessions
                  </p>
                </div>
              </div>
              
              <div 
                className={`flex items-center p-3 border rounded cursor-pointer ${
                  answers[question.id]?.includes('intermediate')
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => {
                  const current = answers[question.id] ? answers[question.id].split(',') : [];
                  if (current.includes('intermediate')) {
                    const index = current.indexOf('intermediate');
                    current.splice(index, 1);
                  } else {
                    current.push('intermediate');
                  }
                  handleAnswerChange(question.id, current.join(','));
                }}
              >
                <input
                  type="checkbox"
                  checked={answers[question.id]?.includes('intermediate') || false}
                  onChange={() => {}}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <h5 className="font-medium">Save Progress</h5>
                  <p className="text-sm text-gray-600">
                    Stores temporary results during complex tasks
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-2">
            <div className="flex items-center">
              {info.icon}
              <span className="ml-2 font-medium">{info.friendlyText || question.text}</span>
            </div>
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded resize-none h-20"
              placeholder={info.placeholder || "Enter your answer..."}
            />
            {info.examples && info.examples.length > 0 && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Examples: </span>
                {info.examples.join(', ')}
              </div>
            )}
          </div>
        );
    }
  };
  
  // Calculate progress
  const totalQuestions = QUALIFYING_QUESTIONS.length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = Math.min(100, Math.round((answeredQuestions / totalQuestions) * 100));
  
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="workload-name" className="block text-sm font-medium text-gray-700 mb-1">
          Give your AI workload a name
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
        <div className="flex justify-between items-end">
          <label htmlFor="workload-description" className="block text-sm font-medium text-gray-700 mb-1">
            Describe what your AI will do
          </label>
          <AnimatePresence>
            {suggestionsAvailable && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="mb-1"
              >
                <button
                  onClick={generateSuggestions}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
                >
                  <Sparkles size={14} className="mr-1" />
                  <span>✨ Let AI fill this out for me</span>
                </button>
              </motion.div>
            )}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-1 text-sm text-indigo-600 flex items-center"
              >
                <div className="animate-spin h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full mr-2"></div>
                <span>Analyzing description...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <textarea
          id="workload-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what your AI will do in everyday language. For example: 'A customer service bot that answers questions about products, handles returns, and can check order status by connecting to our order database.'"
          className="w-full p-2 border border-gray-300 rounded h-24 resize-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors"
        />
        <AnimatePresence>
          {showSuggestionSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700"
            >
              <div className="flex items-center">
                <Sparkles size={14} className="mr-2 text-green-500" />
                <span>Great! We've analyzed your description and filled in the questions below. Please review and adjust if needed.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Progress indicator */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Your progress</span>
          <span className="text-sm font-medium text-indigo-700">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {answeredQuestions === 0 
            ? "Let's get started! Answer the questions below to calculate your credits."
            : answeredQuestions < 2
            ? "Keep going! Answer at least one more question."
            : hasMinimumAnswers && progress < 100
            ? "Great start! You can continue with these answers or complete more for a more accurate estimate."
            : "All done! You can now proceed to the calculator."}
        </p>
      </div>
      
      <div>
        {/* Step indicator */}
        <div className="flex mb-6">
          {questionGroups.map((group, index) => (
            <div 
              key={index}
              className="flex-1 relative"
            >
              <div 
                className={`
                  h-2 
                  ${index === 0 ? 'rounded-l' : ''} 
                  ${index === questionGroups.length - 1 ? 'rounded-r' : ''}
                  ${index <= currentStepIndex ? 'bg-indigo-600' : 'bg-gray-200'}
                `}
              ></div>
              <button 
                onClick={() => setCurrentStepIndex(index)}
                className={`
                  absolute top-4 left-1/2 transform -translate-x-1/2
                  text-xs font-medium px-2 py-1 rounded
                  ${index <= currentStepIndex ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'}
                `}
              >
                {group.title}
              </button>
            </div>
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="pb-6"
          >
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
              <h3 className="text-lg font-semibold mb-1">{currentGroup.title}</h3>
              <p className="text-gray-600 mb-4">{currentGroup.description}</p>
              
              <div className="space-y-6">
                {visibleQuestions.map((question) => (
                  <div 
                    key={question.id} 
                    className="p-4 border border-gray-200 rounded-lg transition-colors duration-200 bg-gray-50 hover:bg-white"
                  >
                    {renderQuestionInput(question)}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="flex justify-between">
        {currentStepIndex > 0 ? (
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center"
          >
            <ArrowRight className="mr-1 h-4 w-4 rotate-180" />
            <span>Back</span>
          </button>
        ) : (
          <div></div> {/* Empty div to maintain flex layout */}
        )}
        
        <button
          onClick={handleContinue}
          disabled={!workloadName || (!hasMinimumAnswers && currentStepIndex === questionGroups.length - 1)}
          className={`
            flex items-center px-4 py-2 rounded font-medium transition-colors duration-200
            ${(!workloadName || (!hasMinimumAnswers && currentStepIndex === questionGroups.length - 1)) 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'}
          `}
        >
          <span>
            {currentStepIndex < questionGroups.length - 1 
              ? 'Continue' 
              : 'Go to Calculator'}
          </span>
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
      
      {/* Skip option for optional questions */}
      {currentStepIndex < questionGroups.length - 1 && (
        <div className="text-center">
          <button
            onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            Skip this section
          </button>
        </div>
      )}
    </div>
  );
};

export default QualifyingQuestions;