// Define the types for credit activities
export type CreditActivity = 
  | 'llm_call'
  | 'reflection_cycle'
  | 'groundedness_check'
  | 'context_relevance_check'
  | 'rag_ingest'
  | 'rag_query'
  | 'data_query'
  | 'memory_short_io'
  | 'memory_long_io'
  | 'filters'
  | 'tool_call'
  | 'dag_workflow'
  | 'managerial_workflow';

// Define the available reasoning tiers
export type ReasoningTier = 'base_model' | 'medium_reasoning' | 'heavy_reasoning';

// Define the workload configuration
export interface Workload {
  activities: Record<CreditActivity, number>;
  iterations: number;
  reasoningTier: ReasoningTier;
}

// Define the calculation result
export interface CalculationResult {
  perIterationCredits: number;
  totalCredits: number;
  totalCostUsd: number;
  breakdown: Record<string, {
    count: number;
    baseCredits: number;
    adjustedCredits: number;
    description: string;
  }>;
}

// Define the qualifying question structure
export interface QualifyingQuestion {
  id: string;
  text: string;
  type?: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'range';
  options?: { value: string; label: string }[];
  dependsOn?: string[];
  min?: number;
  max?: number;
}