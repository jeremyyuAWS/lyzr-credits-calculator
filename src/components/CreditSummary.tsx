import React, { useEffect, useState } from 'react';
import { CalculationResult, ReasoningTier, Workload } from '../types';
import { formatNumber, formatUSD } from '../utils/calculationUtils';
import { Download, Share2, TrendingUp, Activity, Calendar } from 'lucide-react';
import { TIER_MULTIPLIERS } from '../data/creditRates';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'breakdown'>('overview');
  const [animateCount, setAnimateCount] = useState(false);
  const [forecastMonths, setForecastMonths] = useState(6);
  
  // Filter out activities with zero count
  const activeBreakdown = Object.entries(breakdown)
    .filter(([_, details]) => details.count > 0)
    .sort((a, b) => b[1].adjustedCredits - a[1].adjustedCredits);

  // Create data for the doughnut chart
  const doughnutData = {
    labels: activeBreakdown.map(([activity]) => 
      activity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    ),
    datasets: [
      {
        data: activeBreakdown.map(([_, details]) => details.adjustedCredits * iterations),
        backgroundColor: [
          '#6366f1', // indigo-500
          '#8b5cf6', // violet-500
          '#a855f7', // purple-500
          '#d946ef', // fuchsia-500
          '#ec4899', // pink-500
          '#f43f5e', // rose-500
          '#f97316', // orange-500
          '#eab308', // yellow-500
          '#84cc16', // lime-500
          '#22c55e', // green-500
          '#10b981', // emerald-500
          '#14b8a6', // teal-500
          '#06b6d4', // cyan-500
          '#0ea5e9', // sky-500
          '#3b82f6'  // blue-500
        ],
        borderWidth: 1,
      },
    ],
  };

  // Create forecast data
  const generateForecastData = () => {
    const months = [];
    const credits = [];
    const costs = [];
    
    for (let i = 1; i <= forecastMonths; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i - 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      
      // Add some variation to make the forecast more realistic
      const variation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
      const monthCredits = totalCredits * variation;
      credits.push(monthCredits);
      costs.push(monthCredits * 0.01); // $0.01 per credit
    }
    
    return { months, credits, costs };
  };

  const forecast = generateForecastData();
  
  // Line chart configuration for forecast
  const forecastData = {
    labels: forecast.months,
    datasets: [
      {
        label: 'Credits',
        data: forecast.credits,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  const costForecastData = {
    labels: forecast.months,
    datasets: [
      {
        label: 'Cost (USD)',
        data: forecast.costs,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

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

  // Trigger counting animation when result changes
  useEffect(() => {
    setAnimateCount(true);
    const timer = setTimeout(() => setAnimateCount(false), 1000);
    return () => clearTimeout(timer);
  }, [totalCredits, totalCostUsd]);

  // Format number with animation
  const AnimatedCounter = ({ value, formatter }: { value: number, formatter: (n: number) => string }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (!animateCount) {
        setCount(value);
        return;
      }
      
      let start = 0;
      const step = value / 20;
      const interval = setInterval(() => {
        start += step;
        if (start >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(start);
        }
      }, 20);
      
      return () => clearInterval(interval);
    }, [value, animateCount]);
    
    return <>{formatter(count)}</>;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
        <h3 className="text-xl font-bold">Estimated Credits & Cost</h3>
        <p className="text-sm opacity-80">Based on your workload configuration</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'overview' 
              ? 'border-b-2 border-indigo-500 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Activity size={16} className="inline mr-1" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'forecast' 
              ? 'border-b-2 border-indigo-500 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <TrendingUp size={16} className="inline mr-1" />
          Forecast
        </button>
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'breakdown' 
              ? 'border-b-2 border-indigo-500 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={16} className="inline mr-1" />
          Breakdown
        </button>
      </div>
      
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <motion.div 
                    className="bg-gray-50 p-3 rounded-md"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-sm text-gray-500">Per Iteration</div>
                    <div className="text-xl font-bold">
                      <AnimatedCounter value={perIterationCredits} formatter={formatNumber} /> credits
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gray-50 p-3 rounded-md"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="text-sm text-gray-500">Total Credits</div>
                    <div className="text-xl font-bold">
                      <AnimatedCounter value={totalCredits} formatter={formatNumber} /> credits
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(perIterationCredits)} × {iterations} iterations
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-indigo-50 p-3 rounded-md"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className="text-sm text-indigo-700">Estimated Cost</div>
                    <div className="text-xl font-bold text-indigo-800">
                      <AnimatedCounter value={totalCostUsd} formatter={formatUSD} />
                    </div>
                    <div className="text-xs text-indigo-600">
                      {formatNumber(totalCredits)} × $0.01 per credit
                    </div>
                  </motion.div>
                </div>
                
                {activeBreakdown.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-3">Credit Distribution</h4>
                    <div className="h-64">
                      <Doughnut 
                        data={doughnutData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                boxWidth: 12,
                                padding: 15,
                                font: {
                                  size: 10
                                }
                              }
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  const value = context.raw as number;
                                  const percentage = Math.round((value / totalCredits) * 100);
                                  return `${context.label}: ${formatNumber(value)} credits (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'forecast' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Monthly Usage Forecast</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Projected credit usage over the next {forecastMonths} months based on current settings
                  </p>
                  
                  <div className="mb-4">
                    <label className="text-sm text-gray-600 block mb-1">Forecast Period</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="3"
                        max="12"
                        value={forecastMonths}
                        onChange={(e) => setForecastMonths(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <span className="text-sm font-medium w-20">{forecastMonths} months</span>
                    </div>
                  </div>
                  
                  <div className="h-64 mb-6">
                    <Line 
                      data={forecastData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Credits'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                return `Credits: ${formatNumber(context.raw as number)}`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  
                  <h4 className="font-medium mb-2">Cost Projection</h4>
                  <div className="h-64">
                    <Line 
                      data={costForecastData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Cost (USD)'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                return `Cost: ${formatUSD(context.raw as number)}`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h4 className="text-sm font-medium text-indigo-800 mb-1">Forecast Insights</h4>
                  <p className="text-xs text-indigo-700">
                    At your current usage rate, you'll spend approximately {formatUSD(totalCostUsd * forecastMonths)} over the next {forecastMonths} months.
                    {totalCostUsd > 10 && " Consider optimizing your LLM operations to reduce costs."}
                    {totalCostUsd < 5 && " Your current usage is very cost-effective."}
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'breakdown' && (
              <div>
                <h4 className="font-medium mb-2">Activity Cost Breakdown</h4>
                <div className="max-h-[300px] overflow-y-auto pr-2">
                  {activeBreakdown.map(([activity, details], index) => {
                    const percentage = (details.adjustedCredits * iterations / totalCredits) * 100;
                    return (
                      <motion.div 
                        key={activity}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="mb-3"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-sm font-medium">
                            {activity.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </div>
                          <div className="text-sm font-medium">
                            {formatNumber(details.adjustedCredits * iterations)} credits
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div 
                            className="bg-indigo-600 h-2 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                          ></motion.div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>
                            {details.count} × {details.baseCredits} 
                            {details.baseCredits !== details.adjustedCredits / details.count 
                              ? ` × ${details.adjustedCredits / (details.baseCredits * details.count)}` 
                              : ''}
                          </span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Optimization Tips</h4>
                  <ul className="text-xs text-yellow-700 list-disc pl-4 space-y-1">
                    {totalCredits > 100 && (
                      <li>Consider reducing the number of LLM calls for high-volume operations</li>
                    )}
                    {Object.entries(breakdown).some(([key, val]) => 
                      key.includes('llm') && val.count > 5) && (
                      <li>Batch LLM operations where possible to reduce total API calls</li>
                    )}
                    {reasoningTier === 'heavy_reasoning' && (
                      <li>For less complex tasks, Medium Reasoning tier may be sufficient</li>
                    )}
                    {iterations > 10 && (
                      <li>High iteration count significantly impacts total cost</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        <div className="flex space-x-2 mt-4 pt-4 border-t">
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