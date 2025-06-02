import { CreditActivity, CalculationResult, Workload } from '../types';
import { CREDIT_RATES, LLM_DEPENDENT_ACTIVITIES, TIER_MULTIPLIERS } from '../data/creditRates';

// Format a number with commas for thousands
export const formatNumber = (value: number): string => {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
};

// Format a number as USD currency
export const formatUSD = (value: number): string => {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
};

// Calculate credits based on workload configuration
export const calculateCredits = (workload: Workload): CalculationResult => {
  const { activities, reasoningTier, iterations } = workload;
  const tierMultiplier = TIER_MULTIPLIERS[reasoningTier];
  
  let totalCreditsPerIteration = 0;
  const breakdown: Record<string, {
    count: number;
    baseCredits: number;
    adjustedCredits: number;
    description: string;
  }> = {};
  
  // Calculate credits for each activity
  Object.entries(activities).forEach(([activity, count]) => {
    if (count > 0) {
      const activityKey = activity as CreditActivity;
      const { baseCredits, description } = CREDIT_RATES[activityKey];
      
      // Apply tier multiplier for LLM-dependent activities
      const multiplier = LLM_DEPENDENT_ACTIVITIES.includes(activityKey) ? tierMultiplier : 1;
      const adjustedCredits = baseCredits * count * multiplier;
      
      totalCreditsPerIteration += adjustedCredits;
      
      breakdown[activity] = {
        count,
        baseCredits,
        adjustedCredits,
        description
      };
    }
  });
  
  const totalCredits = totalCreditsPerIteration * iterations;
  
  // Calculate cost at $0.01 per credit
  const totalCostUsd = totalCredits * 0.01;
  
  return {
    perIterationCredits: totalCreditsPerIteration,
    totalCredits,
    totalCostUsd,
    breakdown
  };
};