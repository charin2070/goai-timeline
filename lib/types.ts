import { Description, Provider } from "@radix-ui/react-toast";

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
    };
    finish_reason?: string;
  }[];
}

export interface ApiError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export interface MistralModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: any[];
  root: string;
  parent: string | null;
}

export interface MistralModelsResponse {
  object: string;
  data: MistralModel[];
}

export const OpenRouterGemma3Model: AIModel = {
  name: 'Google Gemma 3',
  index: 'google/gemma-3-4b',
  description: 'Быстрая и доступная модель от Google через OpenRouter'
};

export const OpenRouterAiProvider = {
  name: 'OpenRouter',
  models: [OpenRouterGemma3Model],
};

export type AIModel = {
  name: string;
  description: string;
  index: string;
};

export interface ProviderConfig {
  id: string;
  name: string;
  models: AIModel[];
  description: string;
}

export const Gemma3Model = {
  name: 'Google Gemma 3',
  index: 'google/gemma-3-4b',
  description: 'Топ за свои деньги'
};

// The list of AI providers is now fetched from the database.
// This type is used to identify the selected provider.
export type AIProvider = 'google-gemma' | 'mistral-medium' | 'gigachat';

export const AI_PROVIDERS: ProviderConfig[] = [
    {
        id: 'google-gemma',
        name: 'Google Gemma',
        models: [],
        description: 'Быстрая и эффективная модель для общих разговоров'
    },
    {
        id: 'mistral-medium',
        name: 'Mistral Medium',
        models: [],
        description: 'Продвинутая модель с улучшенными возможностями рассуждения'
    },
    {
        id: 'gigachat',
        name: 'GigaChat',
        models: [],
        description: 'Модель от Сбера'
    }
];