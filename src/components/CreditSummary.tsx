import React from 'react';
import { CalculationResult, ReasoningTier, Workload } from '../types';
import { formatNumber, formatUSD } from '../utils/calculationUtils';
import { Download, Share2 } from 'lucide-react';
import { TIER_MULTIPLIERS } from '../data/creditRates';

interface CreditSummaryProps {
  result: CalculationResult;
  workloadName: string;
  reasoningTier: ReasoningTier;
  iterations: number;
  workload: Workload;
}

const CreditSummary: React.FC<CreditSummaryProps> = ({ 
  result, 
  workloadName,
  reasoningTier,
  iterations,
  workload
}) => {
  const { perIterationCredits, totalCredits, totalCostUsd, breakdown } = result;
  
  // Filter out activities with zero count
  const activeBreakdown = Object.entries(breakdown)
    .filter(([_, details]) => details.count > 0)
    .sort((a, b) => b[1].adjustedCredits - a[1].adjustedCredits);

  const handleExport = () => {
    const tierMultiplier = TIER_MULTIPLIERS[reasoningTier];
    
    const data = {
      workloadName,
      reasoningTier,
      tierMultiplier,
      iterations,
      perIterationCredits,
      totalCredits,
      totalCostUsd,
      breakdown: Object.fromEntries(
        Object.entries(breakdown)
          .filter(([_, details]) => details.count > 0)
      ),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lyzr-estimate-${workloadName.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const summary = `Lyzr Estimate for ${workloadName}:\n` +
      `${formatNumber(totalCredits)} credits (${formatUSD(totalCostUsd)})\n` +
      `Reasoning tier: ${reasoningTier} (${TIER_MULTIPLIERS[reasoningTier]}×)\n` +
      `Iterations: ${iterations}`;
      
    if (navigator.share) {
      navigator.share({
        title: 'Lyzr Credits Estimate',
        text: summary
      }).catch(err => {
        console.error('Error sharing:', err);
        copyToClipboard(summary);
      });
    } else {
      copyToClipboard(summary);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Estimate copied to clipboard!'))
      .catch(err => console.error('Could not copy text:', err));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
        <h3 className="text-xl font-bold">Estimated Credits & Cost</h3>
        <p className="text-sm opacity-80">Based on your workload configuration</p>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Per Iteration</div>
            <div className="text-xl font-bold">{formatNumber(perIterationCredits)} credits</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Total Credits</div>
            <div className="text-xl font-bold">{formatNumber(totalCredits)} credits</div>
            <div className="text-xs text-gray-500">
              {formatNumber(perIterationCredits)} × {iterations} iterations
            </div>
          </div>
          
          <div className="bg-indigo-50 p-3 rounded-md">
            <div className="text-sm text-indigo-700">Estimated Cost</div>
            <div className="text-xl font-bold text-indigo-800">{formatUSD(totalCostUsd)}</div>
            <div className="text-xs text-indigo-600">
              {formatNumber(totalCredits)} × $0.01 per credit
            </div>
          </div>
        </div>
        
        {activeBreakdown.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Activity Breakdown</h4>
            <div className="max-h-60 overflow-y-auto pr-2">
              {activeBreakdown.map(([activity, details]) => (
                <div 
                  key={activity}
                  className="flex justify-between items-center py-2 border-b border-gray-100"
                >
                  <div className="text-sm">
                    <span className="font-medium">
                      {activity.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">
                      ({details.count} × {details.baseCredits} 
                      {details.baseCredits !== details.adjustedCredits / details.count 
                        ? ` × ${details.adjustedCredits / (details.baseCredits * details.count)}` 
                        : ''}
                      )
                    </span>
                  </div>
                  <div className="font-medium">
                    {formatNumber(details.adjustedCredits * iterations)} credits
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          <button 
            onClick={handleExport} 
            className="flex items-center space-x-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors duration-200"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          
          <button 
            onClick={handleShare}
            className="flex items-center space-x-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors duration-200"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditSummary;