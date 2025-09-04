'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, Zap, BrainCircuit } from 'lucide-react';
import { AIProvider, AIModel, ProviderConfig } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from 'framer-motion';

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.2,
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: { opacity: 1, y: 0 }
};

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="w-full justify-between">
            {selectedProviderName}
            {getProviderIcon(safeSelectedProvider)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent asChild>
          <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="hidden">
            {availableProviders.map((provider) => (
              <DropdownMenuItem key={provider.id} onSelect={() => onProviderChange(provider.id as AIProvider)}>
                <motion.div variants={itemVariants} className="flex items-center justify-between w-full">
                  <span>{provider.name}</span>
                  {showStatus && <Badge variant={getProviderStatus(provider.id as AIProvider).variant}>{getProviderStatus(provider.id as AIProvider).text}</Badge>}
                </motion.div>
              </DropdownMenuItem>
            ))}
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
