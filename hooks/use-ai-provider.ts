'use client';

import { useState, useCallback } from 'react';
import { AIProvider, AI_PROVIDERS } from '@/lib/types';

export function useAiProvider(initialProvider: AIProvider = 'google-gemma') {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(initialProvider);
  const [isLoading, setIsLoading] = useState(false);

  const changeProvider = useCallback((provider: AIProvider) => {
    setSelectedProvider(provider);
    setIsLoading(true);
    
    // Simulate loading state for provider switch
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const getCurrentProvider = useCallback(() => {
    return AI_PROVIDERS.find(p => p.id === selectedProvider);
  }, [selectedProvider]);

  const isProviderAvailable = useCallback((provider: AIProvider) => {
    return AI_PROVIDERS.some(p => p.id === provider);
  }, []);

  const getProviderStatus = useCallback((provider: AIProvider) => {
    switch (provider) {
      case 'google-gemma':
        return { text: 'Free', variant: 'default' as const, available: true };
      case 'mistral-medium':
        return { text: 'Premium', variant: 'secondary' as const, available: true };
      default:
        return { text: 'Unknown', variant: 'outline' as const, available: false };
    }
  }, []);

  return {
    selectedProvider,
    changeProvider,
    getCurrentProvider,
    isProviderAvailable,
    getProviderStatus,
    isLoading,
    availableProviders: AI_PROVIDERS,
  };
}