'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, Zap, BrainCircuit } from 'lucide-react';
import { AIProvider, AIModel, ProviderConfig } from '@/lib/types';

interface AiProviderDropdownProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  availableProviders: ProviderConfig[];
  className?: string;
  showStatus?: boolean;
  compact?: boolean;
}

export function AiProviderDropdown({ 
  selectedProvider, 
  onProviderChange, 
  availableProviders,
  className = '',
  showStatus = true,
  compact = false
}: AiProviderDropdownProps) {

  const getProviderIcon = (providerId: AIProvider) => {
    switch (providerId) {
      case 'google-gemma':
        return <Sparkles className="w-4 h-4" />;
      case 'mistral-medium':
        return <Zap className="w-4 h-4" />;
      case 'gigachat':
        return <BrainCircuit className="w-4 h-4" />;
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

  const selectedProviderName = availableProviders.find(p => p.id === selectedProvider)?.name || (selectedProvider || 'Select a model');

  const safeSelectedProvider = selectedProvider || (availableProviders[0]?.id as AIProvider | undefined) || 'google-gemma';

  return (
    <div className={`ai-provider-dropdown ${className}`}>
      {!compact && (
        <div className="text-xs font-medium text-gray-400 mb-2 flex items-center">
          <Bot className="w-3 h-3 mr-1" />
          AI Provider
        </div>
      )}
      <div className="relative">
        <select 
          value={safeSelectedProvider} 
          onChange={(e) => {
            console.log('Dropdown value changed to:', e.target.value);
            onProviderChange(e.target.value as AIProvider);
          }}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none text-black"
        >
          {availableProviders.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
              {showStatus && ` (${getProviderStatus(provider.id as AIProvider).text})`}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {getProviderIcon(safeSelectedProvider)}
        </div>
      </div>
      {showStatus && (
        <div className="mt-2 flex items-center gap-2">
          <Badge 
            variant={getProviderStatus(safeSelectedProvider).variant} 
            className="text-xs"
          >
            {getProviderStatus(safeSelectedProvider).text}
          </Badge>
        </div>
      )}
    </div>
  );
}