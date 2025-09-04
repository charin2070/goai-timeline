'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Bot } from 'lucide-react';
import { AIProvider, AI_PROVIDERS } from '@/lib/types';

interface AiProviderInfoProps {
  provider: AIProvider;
  showDescription?: boolean;
  className?: string;
}

export function AiProviderInfo({ 
  provider, 
  showDescription = false, 
  className = '' 
}: AiProviderInfoProps) {
  const providerConfig = AI_PROVIDERS.find(p => p.id === provider);
  
  const getProviderIcon = (providerId: AIProvider) => {
    switch (providerId) {
      case 'google-gemma':
        return <Sparkles className="w-4 h-4" />;
      case 'mistral-medium':
        return <Zap className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getProviderStatus = (providerId: AIProvider) => {
    switch (providerId) {
      case 'google-gemma':
        return { text: 'Free', variant: 'default' as const };
      case 'mistral-medium':
        return { text: 'Premium', variant: 'secondary' as const };
      default:
        return { text: 'Unknown', variant: 'outline' as const };
    }
  };

  if (!providerConfig) {
    return null;
  }

  return (
    <div className={`ai-provider-info flex items-center gap-2 ${className}`}>
      {getProviderIcon(provider)}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{providerConfig.name}</span>
          <Badge variant={getProviderStatus(provider).variant} className="text-xs">
            {getProviderStatus(provider).text}
          </Badge>
        </div>
        {showDescription && (
          <span className="text-xs text-gray-500">{providerConfig.description}</span>
        )}
      </div>
    </div>
  );
} 