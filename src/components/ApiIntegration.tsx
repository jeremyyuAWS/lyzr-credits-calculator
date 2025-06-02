import React, { useState } from 'react';
import { CalculationResult, Workload } from '../types';
import { TIER_MULTIPLIERS } from '../data/creditRates';
import { Code, Copy, Send } from 'lucide-react';

interface ApiIntegrationProps {
  workloadName: string;
  reasoningTier: string;
  workload: Workload;
  result: CalculationResult;
}

const ApiIntegration: React.FC<ApiIntegrationProps> = ({
  workloadName,
  reasoningTier,
  workload,
  result
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  // Generate the API request payload based on the workload
  const generateRequestPayload = () => {
    // Convert the workload activities to the format expected by the API
    const steps = Object.entries(workload.activities)
      .filter(([_, units]) => units > 0)
      .map(([slug, units]) => ({
        slug,
        units
      }));

    return {
      workload_name: workloadName,
      reasoning_tier: reasoningTier,
      iterations: workload.iterations,
      steps
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

    const requestPayload = generateRequestPayload();
    const apiKey = import.meta.env.VITE_LYZR_API_KEY;
    
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

      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error making API request:', error);
      setResponse(JSON.stringify({ error: 'Failed to make API request. Please check your Netlify environment variables.' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors duration-200"
      >
        <Send size={16} />
        <span>Send to Lyzr API</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Send to Lyzr API</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">API Request</h3>
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
                  onClick={() => setShowModal(false)}
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

              {response && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">API Response</h3>
                  <div className="bg-gray-800 text-gray-200 p-4 rounded overflow-auto max-h-60">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">JSON Response</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(response)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                      {response}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiIntegration;