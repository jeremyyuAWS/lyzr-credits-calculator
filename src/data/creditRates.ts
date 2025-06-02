import { CreditActivity, ReasoningTier } from '../types';

// Credit multipliers for different reasoning tiers
export const TIER_MULTIPLIERS: Record<ReasoningTier, number> = {
  base_model: 1,
  medium_reasoning: 4,
  heavy_reasoning: 8
};

// Descriptions for each reasoning tier
export const TIER_DESCRIPTIONS: Record<ReasoningTier, string> = {
  base_model: 'Basic reasoning suitable for simple tasks and queries. Most cost-effective option.',
  medium_reasoning: 'Enhanced reasoning for more complex tasks requiring analytical thinking.',
  heavy_reasoning: 'Advanced reasoning for expert-level tasks with multi-step complex decision making.'
};

// Define which activities are affected by the LLM tier multiplier
export const LLM_DEPENDENT_ACTIVITIES: CreditActivity[] = [
  'llm_call',
  'reflection_cycle',
  'groundedness_check',
  'context_relevance_check'
];

// Base credit rates for each activity
export const CREDIT_RATES: Record<CreditActivity, { baseCredits: number; description: string }> = {
  llm_call: {
    baseCredits: 5,
    description: 'Standard LLM API call for generating text or answering questions'
  },
  reflection_cycle: {
    baseCredits: 10,
    description: 'Self-evaluation and refinement of responses for improved quality'
  },
  groundedness_check: {
    baseCredits: 8,
    description: 'Verifying that output is grounded in the provided context'
  },
  context_relevance_check: {
    baseCredits: 6,
    description: 'Checking if the context is relevant to the query'
  },
  rag_ingest: {
    baseCredits: 2,
    description: 'Processing and indexing documents for retrieval'
  },
  rag_query: {
    baseCredits: 3,
    description: 'Retrieving relevant information from indexed documents'
  },
  data_query: {
    baseCredits: 1,
    description: 'Querying structured data sources'
  },
  memory_short_io: {
    baseCredits: 1,
    description: 'Short-term memory operations (read/write)'
  },
  memory_long_io: {
    baseCredits: 2,
    description: 'Long-term memory operations (read/write)'
  },
  filters: {
    baseCredits: 1,
    description: 'Content filtering and moderation'
  },
  tool_call: {
    baseCredits: 2,
    description: 'External API or tool integration'
  },
  dag_workflow: {
    baseCredits: 4,
    description: 'Directed acyclic graph workflow execution'
  },
  managerial_workflow: {
    baseCredits: 6,
    description: 'Complex workflow with task delegation and coordination'
  }
};