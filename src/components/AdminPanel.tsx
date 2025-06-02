import React, { useState } from 'react';
import { CalculationResult, Workload } from '../types';
import { TIER_MULTIPLIERS } from '../data/creditRates';
import { Code, Copy, Send, ArrowRight } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { formatNumber, formatUSD } from '../utils/calculationUtils';
import { motion } from 'framer-motion';

interface AdminPanelProps {
  workloadName: string;
  reasoningTier: string;
  workload: Workload;
  result: CalculationResult;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  workloadName,
  reasoningTier,
  workload,
  result
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showComparisonView, setShowComparisonView] = useState(false);

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
      workload_name: workloadName,
      reasoning_tier: reasoningTier,
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
      tier_multiplier: TIER_MULTIPLIERS[reasoningTier as keyof typeof TIER_MULTIPLIERS]
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
            setShowComparisonView(true);
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

  // Helper function to format API response for display
  const formatApiResponse = () => {
    if (!response) return null;
    
    if (showComparisonView && response.per_iteration_credits !== undefined && 
        response.total_credits !== undefined && response.total_cost_usd !== undefined) {
      return (
        <div className="bg-white rounded-lg shadow-md p-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Verification Results</h4>
            <button 
              onClick={() => setShowComparisonView(false)}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View Raw JSON
            </button>
          </div>
          
          {comparisonData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-md font-medium mb-2">Credits Comparison</h5>
                  <div className="h-48">
                    <Doughnut 
                      data={comparisonData.creditsData}
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
                      Math.abs(comparisonData.creditsDiff) < 1 
                        ? 'text-green-600' 
                        : comparisonData.creditsDiff > 0 
                          ? 'text-red-600' 
                          : 'text-blue-600'
                    }`}>
                      {comparisonData.creditsDiff > 0 
                        ? `+${comparisonData.creditsDiff.toFixed(2)}%` 
                        : comparisonData.creditsDiff < 0 
                          ? `${comparisonData.creditsDiff.toFixed(2)}%` 
                          : 'Exact match'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-md font-medium mb-2">Cost Comparison</h5>
                  <div className="h-48">
                    <Doughnut 
                      data={comparisonData.costData}
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
                      Math.abs(comparisonData.costDiff) < 1 
                        ? 'text-green-600' 
                        : comparisonData.costDiff > 0 
                          ? 'text-red-600' 
                          : 'text-blue-600'
                    }`}>
                      {comparisonData.costDiff > 0 
                        ? `+${comparisonData.costDiff.toFixed(2)}%` 
                        : comparisonData.costDiff < 0 
                          ? `${comparisonData.costDiff.toFixed(2)}%` 
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
                Math.abs(comparisonData.creditsDiff) < 1
                  ? 'bg-green-50 border border-green-100'
                  : 'bg-yellow-50 border border-yellow-100'
              }`}>
                <h4 className={`text-sm font-medium mb-1 ${
                  Math.abs(comparisonData.creditsDiff) < 1
                    ? 'text-green-800'
                    : 'text-yellow-800'
                }`}>Verification Status</h4>
                <p className={`text-xs ${
                  Math.abs(comparisonData.creditsDiff) < 1
                    ? 'text-green-700'
                    : 'text-yellow-700'
                }`}>
                  {Math.abs(comparisonData.creditsDiff) < 1 
                    ? 'The client-side calculation matches the Lyzr API response within expected precision. The calculator is accurate.' 
                    : `There is a ${Math.abs(comparisonData.creditsDiff).toFixed(2)}% difference between client-side calculation and Lyzr API response. This may be due to rounding differences or calculation updates.`}
                </p>
              </div>
            </div>
          )}
        </div>
      );
    } else if (response.per_iteration_credits !== undefined && 
        response.total_credits !== undefined && 
        response.total_cost_usd !== undefined) {
      // Basic response view
      return (
        <div className="bg-white rounded-lg shadow-md p-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">API Response</h4>
            {!showComparisonView && (
              <button 
                onClick={() => setShowComparisonView(true)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                View Comparison
              </button>
            )}
          </div>
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs max-h-[300px]">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      );
    }
    
    // Fallback for other response structures
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mt-4">
        <h4 className="text-lg font-semibold mb-3">API Response</h4>
        <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs max-h-[300px]">
          {JSON.stringify(response, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-4">
        <h3 className="text-xl font-bold">Administrator Panel</h3>
        <p className="text-sm opacity-80">Lyzr API Integration and Verification</p>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Send to Lyzr API</h4>
          <p className="text-sm text-gray-600 mb-4">
            This feature allows you to verify your calculation with the Lyzr Credits Calculator API. 
            The API key is configured through Netlify environment variables.
          </p>
          
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
          
          <div className="mt-4 flex justify-end">
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
        </div>
        
        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            <p className="font-medium">Error</p>
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
        
        {/* API Response Display */}
        {response && formatApiResponse()}
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
          <h4 className="text-md font-medium text-yellow-800 mb-2">Administrator Notes</h4>
          <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
            <li>API key is stored in Netlify environment variables as <code>VITE_LYZR_API_KEY</code></li>
            <li>User ID is hardcoded to "jeremy@lyzr.ai" for all requests</li>
            <li>Session IDs are randomly generated for each request</li>
            <li>The complete calculation payload is included in each request for verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;