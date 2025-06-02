import React from 'react';
import { X, CreditCard, ArrowRight, Brain, PieChart, Cpu } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <CreditCard className="mr-2 h-6 w-6 text-indigo-600" />
            About Lyzr Credits Calculator
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">What are Lyzr Credits?</h3>
            <p className="text-gray-600 mb-4">
              Lyzr Credits are the standard unit of measurement for AI workloads on the Lyzr platform. 
              They provide a consistent way to estimate costs across different types of AI operations, 
              regardless of the underlying models or infrastructure.
            </p>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-indigo-800 text-sm">
                <strong>1 Lyzr Credit = $0.01</strong> — Credits are priced at 1 cent each, making it easy to 
                calculate the cost of your AI workloads.
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">How the Calculator Works</h3>
            <div className="space-y-4">
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    1
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Specify Your Workload</h4>
                  <p className="text-gray-600 text-sm">
                    Answer a few questions about your AI usage, or directly configure the activities in your workload.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    2
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Select a Reasoning Tier</h4>
                  <p className="text-gray-600 text-sm">
                    Choose the level of reasoning required: Base Model (1×), Medium Reasoning (4×), or 
                    Heavy Reasoning (8×). The multiplier affects LLM-dependent operations.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    3
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Review Your Estimate</h4>
                  <p className="text-gray-600 text-sm">
                    See the total credits and estimated cost for your workload, with a detailed breakdown by activity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Understanding Reasoning Tiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Cpu size={20} className="text-emerald-600 mr-2" />
                  <h4 className="font-medium">Base Model (1×)</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Suitable for simple tasks like direct Q&A, basic summarization, or straightforward generation.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Brain size={20} className="text-blue-600 mr-2" />
                  <h4 className="font-medium">Medium Reasoning (4×)</h4>
                </div>
                <p className="text-sm text-gray-600">
                  For tasks requiring analytical thinking, multi-step reasoning, or more complex generation.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <PieChart size={20} className="text-purple-600 mr-2" />
                  <h4 className="font-medium">Heavy Reasoning (8×)</h4>
                </div>
                <p className="text-sm text-gray-600">
                  For expert-level tasks like in-depth analysis, complex problem-solving, or specialized domains.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Tips for Optimizing Costs</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Use the lowest reasoning tier that meets your quality requirements</li>
              <li>Batch operations where possible instead of making multiple individual calls</li>
              <li>Optimize prompt engineering to reduce the number of LLM calls needed</li>
              <li>For complex workflows, consider using DAG workflows to manage dependencies efficiently</li>
              <li>Use RAG (Retrieval Augmented Generation) to reduce context size and improve accuracy</li>
            </ul>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Verification Features</h3>
            <p className="text-gray-600 mb-4">
              You can verify your calculations with the Lyzr API to ensure accuracy. This feature:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Sends your workload configuration to the Lyzr API for verification</li>
              <li>Compares client-side calculations with server-side calculations</li>
              <li>Provides visual confirmation of calculation accuracy</li>
            </ul>
            <p className="text-gray-600 mt-4">
              This is especially useful for enterprise users who need to validate cost estimates.
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors duration-200"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;