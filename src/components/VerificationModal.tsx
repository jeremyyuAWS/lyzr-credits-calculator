import React, { useState } from 'react';
import { CalculationResult, Workload } from '../types';
import { TIER_MULTIPLIERS } from '../data/creditRates';
import { Code, Copy, Send, ArrowRight, X } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { formatNumber, formatUSD, calculateCredits } from '../utils/calculationUtils';
import { motion } from 'framer-motion';

interface VerificationModalProps {
  workload: Workload;
  onClose: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  workload,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showComparisonView, setShowComparisonView] = useState(true);
  
  const result = calculateCredits(workload);
  
  // Generate the API request payload based on the workload
  const generateRequestPayload = () => {
    // Convert the workload activities to the format expected by the API
    const steps = Object.entries(workload.activities)
      .filter(([_, units]) => units > 0)
      .map(([slug, units]) => ({
        slug,
        units
      }));

    // Create a complete payload with all calculator options
    return {
      workload_name: "Lyzr Workload",
      reasoning_tier: workload.reasoningTier,
      iterations: workload.iterations,
      steps,
      calculated_results: {
        per_iteration_credits: result.perIterationCredits,
        total_credits: result.totalCredits,
        total_cost_usd: result.totalCostUsd
      },
      breakdown: Object.entries(result.breakdown)
        .filter(([_, details]) => details.count > 0)
        .reduce((acc, [activity, details]) => {
          acc[activity] = {
            count: details.count,
            base_credits: details.baseCredits,
            adjusted_credits: details.adjustedCredits,
            description: details.description
          };
          return acc;
        }, {} as Record<string, any>),
      tier_multiplier: TIER_MULTIPLIERS[workload.reasoningTier]
    };
  };

  // Generate the curl command for the API request
  const generateCurlCommand = () => {
    const requestPayload = generateRequestPayload();
    
    return `curl -X POST 'https://agent-dev.test.studio.lyzr.ai/v3/inference/chat/' \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: ${import.meta.env.VITE_LYZR_API_KEY || 'YOUR_API_KEY'}' \\
  -d '{
    "user_id": "jeremy@lyzr.ai",
    "agent_id": "683dbd69c6b0207f29f2432f",
    "session_id": "683dbd69c6b0207f29f2432f-${Math.random().toString(36).substring(2, 10)}",
    "message": ${JSON.stringify(JSON.stringify(requestPayload))}
  }'`;
  };

  // Handle copying the curl command to clipboard
  const handleCopyCommand = () => {
    navigator.clipboard.writeText(generateCurlCommand())
      .then(() => alert('Command copied to clipboard!'))
      .catch(err => console.error('Could not copy text:', err));
  };

  // Handle making the API request
  const handleMakeRequest = async () => {
    setIsLoading(true);
    setResponse(null);
    setErrorMessage(null);

    const requestPayload = generateRequestPayload();
    const apiKey = import.meta.env.VITE_LYZR_API_KEY;
    
    if (!apiKey) {
      setErrorMessage("API key not found. Please add VITE_LYZR_API_KEY to your Netlify environment variables.");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('https://agent-dev.test.studio.lyzr.ai/v3/inference/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          user_id: "jeremy@lyzr.ai",
          agent_id: "683dbd69c6b0207f29f2432f",
          session_id: `683dbd69c6b0207f29f2432f-${Math.random().toString(36).substring(2, 10)}`,
          message: JSON.stringify(requestPayload)
        })
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      
      // Try to parse the content if it's a JSON string
      try {
        if (data.response && typeof data.response === 'string') {
          const parsedContent = JSON.parse(data.response);
          if (parsedContent && typeof parsedContent === 'object') {
            setResponse(parsedContent);
          } else {
            setResponse(data);
          }
        } else {
          setResponse(data);
        }
      } catch (e) {
        // If parsing fails, just use the original response
        setResponse(data);
      }
    } catch (error) {
      console.error('Error making API request:', error);
      setErrorMessage(`Failed to make API request. ${error instanceof Error ? error.message : 'Please check your Netlify environment variables.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Create comparison visualization data
  const createComparisonData = () => {
    if (!response || !response.total_credits) return null;
    
    // Credits comparison
    const creditsDiff = (response.total_credits - result.totalCredits) / result.totalCredits * 100;
    const creditsData = {
      labels: ['Client Calculation', 'Lyzr API'],
      datasets: [{
        data: [result.totalCredits, response.total_credits],
        backgroundColor: ['#8b5cf6', '#6366f1'],
        borderWidth: 0
      }]
    };
    
    // Cost comparison
    const costDiff = (response.total_cost_usd - result.totalCostUsd) / result.totalCostUsd * 100;
    const costData = {
      labels: ['Client Calculation', 'Lyzr API'],
      datasets: [{
        data: [result.totalCostUsd, response.total_cost_usd],
        backgroundColor: ['#10b981', '#06b6d4'],
        borderWidth: 0
      }]
    };
    
    return { creditsData, costData, creditsDiff, costDiff };
  };

  const comparisonData = response ? createComparisonData() : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Verify with Lyzr API</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {!response ? (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3">API Request</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Verify your calculation with the Lyzr Credits Calculator API. This will send your workload configuration 
                  to the Lyzr platform and compare the results with your client-side calculation.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Per Iteration</div>
                      <div className="text-base font-bold">{formatNumber(result.perIterationCredits)} credits</div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Total Credits</div>
                      <div className="text-base font-bold">{formatNumber(result.totalCredits)} credits</div>
                      <div className="text-xs text-gray-500">
                        {formatNumber(result.perIterationCredits)} × {workload.iterations} iterations
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Estimated Cost</div>
                      <div className="text-base font-bold">{formatUSD(result.totalCostUsd)}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Reasoning tier: <span className="font-medium">{workload.reasoningTier.replace('_', ' ')}</span>
                    <span className="mx-2">•</span>
                    Multiplier: <span className="font-medium">{TIER_MULTIPLIERS[workload.reasoningTier]}×</span>
                    <span className="mx-2">•</span>
                    Active steps: <span className="font-medium">
                      {Object.values(workload.activities).filter(v => v > 0).length}
                    </span>
                  </div>
                </div>
                
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{errorMessage}</p>
                  </div>
                )}
                
                <div className="bg-gray-800 text-gray-200 p-4 rounded overflow-auto max-h-60">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">CURL Command</span>
                    <button 
                      onClick={handleCopyCommand}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                    {generateCurlCommand()}
                  </pre>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMakeRequest}
                  disabled={isLoading}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded transition-colors duration-200
                    ${isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
                  `}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Make API Request</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Verification Results</h3>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowComparisonView(!showComparisonView)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {showComparisonView ? "View Raw JSON" : "View Comparison"}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
              
              {showComparisonView && response.per_iteration_credits !== undefined && 
                response.total_credits !== undefined && response.total_cost_usd !== undefined ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-md font-medium mb-2">Credits Comparison</h5>
                      <div className="h-48">
                        <Doughnut 
                          data={comparisonData?.creditsData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom'
                              },
                              tooltip: {
                                callbacks: {
                                  label: (context) => `${context.label}: ${formatNumber(context.raw as number)} credits`
                                }
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <span className={`text-sm font-medium ${
                          Math.abs(comparisonData?.creditsDiff || 0) < 1 
                            ? 'text-green-600' 
                            : (comparisonData?.creditsDiff || 0) > 0 
                              ? 'text-red-600' 
                              : 'text-blue-600'
                        }`}>
                          {(comparisonData?.creditsDiff || 0) > 0 
                            ? `+${comparisonData?.creditsDiff.toFixed(2)}%` 
                            : (comparisonData?.creditsDiff || 0) < 0 
                              ? `${comparisonData?.creditsDiff.toFixed(2)}%` 
                              : 'Exact match'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-md font-medium mb-2">Cost Comparison</h5>
                      <div className="h-48">
                        <Doughnut 
                          data={comparisonData?.costData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom'
                              },
                              tooltip: {
                                callbacks: {
                                  label: (context) => `${context.label}: ${formatUSD(context.raw as number)}`
                                }
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <span className={`text-sm font-medium ${
                          Math.abs(comparisonData?.costDiff || 0) < 1 
                            ? 'text-green-600' 
                            : (comparisonData?.costDiff || 0) > 0 
                              ? 'text-red-600' 
                              : 'text-blue-600'
                        }`}>
                          {(comparisonData?.costDiff || 0) > 0 
                            ? `+${comparisonData?.costDiff.toFixed(2)}%` 
                            : (comparisonData?.costDiff || 0) < 0 
                              ? `${comparisonData?.costDiff.toFixed(2)}%` 
                              : 'Exact match'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div 
                      className="bg-white p-3 rounded-md border"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-xs text-gray-500 mb-1">Per Iteration</div>
                      <div className="flex items-center">
                        <div className="text-base font-bold">{formatNumber(result.perIterationCredits)}</div>
                        <ArrowRight size={12} className="mx-1 text-gray-400" />
                        <div className="text-base font-bold">{formatNumber(response.per_iteration_credits)}</div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white p-3 rounded-md border"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <div className="text-xs text-gray-500 mb-1">Total Credits</div>
                      <div className="flex items-center">
                        <div className="text-base font-bold">{formatNumber(result.totalCredits)}</div>
                        <ArrowRight size={12} className="mx-1 text-gray-400" />
                        <div className="text-base font-bold">{formatNumber(response.total_credits)}</div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white p-3 rounded-md border"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <div className="text-xs text-gray-500 mb-1">Total Cost</div>
                      <div className="flex items-center">
                        <div className="text-base font-bold">{formatUSD(result.totalCostUsd)}</div>
                        <ArrowRight size={12} className="mx-1 text-gray-400" />
                        <div className="text-base font-bold">{formatUSD(response.total_cost_usd)}</div>
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${
                    Math.abs(comparisonData?.creditsDiff || 0) < 1
                      ? 'bg-green-50 border border-green-100'
                      : 'bg-yellow-50 border border-yellow-100'
                  }`}>
                    <h4 className={`text-sm font-medium mb-1 ${
                      Math.abs(comparisonData?.creditsDiff || 0) < 1
                        ? 'text-green-800'
                        : 'text-yellow-800'
                    }`}>Verification Status</h4>
                    <p className={`text-xs ${
                      Math.abs(comparisonData?.creditsDiff || 0) < 1
                        ? 'text-green-700'
                        : 'text-yellow-700'
                    }`}>
                      {Math.abs(comparisonData?.creditsDiff || 0) < 1 
                        ? 'The client-side calculation matches the Lyzr API response within expected precision. The calculator is accurate.' 
                        : `There is a ${Math.abs(comparisonData?.creditsDiff || 0).toFixed(2)}% difference between client-side calculation and Lyzr API response. This may be due to rounding differences or calculation updates.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs max-h-[500px]">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;