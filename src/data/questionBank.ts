import { QualifyingQuestion, CreditActivity, ReasoningTier } from '../types';

// Qualifying questions for the workload configuration
export const QUALIFYING_QUESTIONS: QualifyingQuestion[] = [
  {
    id: 'usage_frequency',
    text: 'How often will this AI workload be used?',
    type: 'select',
    options: [
      { value: 'on-demand', label: 'On-demand (occasionally)' },
      { value: 'daily', label: 'Daily (1-2 times per day)' },
      { value: 'hourly', label: 'Hourly (several times a day)' },
      { value: 'continuous', label: 'Continuous (always running)' },
      { value: 'weekly', label: 'Weekly (few times per week)' },
      { value: 'monthly', label: 'Monthly (few times per month)' }
    ]
  },
  {
    id: 'complexity',
    text: 'How complex are the tasks this AI will perform?',
    type: 'range',
    min: 1,
    max: 5
  },
  {
    id: 'steps',
    text: 'How many steps are required to complete each task?',
    type: 'number',
    min: 1,
    max: 10
  },
  {
    id: 'external_calls',
    text: 'Will this AI need to make external API calls?',
    type: 'boolean'
  },
  {
    id: 'data_sources',
    text: 'How many different data sources will this AI access?',
    type: 'number',
    min: 0
  },
  {
    id: 'safety_filters',
    text: 'Will this AI require safety filters for content moderation?',
    type: 'boolean'
  },
  {
    id: 'input_size',
    text: 'What is the typical size of inputs this AI will process?',
    type: 'select',
    options: [
      { value: 'small', label: 'Small (few sentences)' },
      { value: 'medium', label: 'Medium (paragraphs)' },
      { value: 'large', label: 'Large (documents)' },
      { value: 'very_large', label: 'Very large (multiple documents)' }
    ]
  },
  {
    id: 'memory_requirements',
    text: 'What memory requirements does this AI have?',
    type: 'multiselect',
    options: [
      { value: 'short_term', label: 'Short-term (conversation history)' },
      { value: 'long_term', label: 'Long-term (persistent knowledge)' },
      { value: 'intermediate', label: 'Intermediate (processing steps)' }
    ]
  }
];

// Common use cases with predefined settings
export const COMMON_USE_CASES = [
  {
    name: 'Simple Question Answering',
    description: 'Basic Q&A without complex reasoning',
    suggestedTier: 'base_model' as ReasoningTier,
    defaultActivities: {
      llm_call: 3,
      context_relevance_check: 1,
      rag_query: 1
    }
  },
  {
    name: 'Customer Support Bot',
    description: 'Handle customer queries with context awareness',
    suggestedTier: 'medium_reasoning' as ReasoningTier,
    defaultActivities: {
      llm_call: 5,
      reflection_cycle: 1,
      groundedness_check: 2,
      rag_query: 3,
      memory_short_io: 2,
      filters: 3
    }
  },
  {
    name: 'Content Generation',
    description: 'Create blog posts, articles or marketing copy',
    suggestedTier: 'medium_reasoning' as ReasoningTier,
    defaultActivities: {
      llm_call: 8,
      reflection_cycle: 3,
      groundedness_check: 2,
      rag_query: 4,
      filters: 1
    }
  },
  {
    name: 'Research Assistant',
    description: 'Deep research with multiple sources',
    suggestedTier: 'heavy_reasoning' as ReasoningTier,
    defaultActivities: {
      llm_call: 12,
      reflection_cycle: 5,
      groundedness_check: 8,
      context_relevance_check: 6,
      rag_ingest: 10,
      rag_query: 15,
      memory_long_io: 4,
      dag_workflow: 2
    }
  },
  {
    name: 'Data Analysis',
    description: 'Analyze data and generate insights',
    suggestedTier: 'heavy_reasoning' as ReasoningTier,
    defaultActivities: {
      llm_call: 6,
      reflection_cycle: 4,
      data_query: 10,
      tool_call: 5,
      dag_workflow: 2
    }
  }
];