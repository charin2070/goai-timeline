'use client';

import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { AIProvider, AI_PROVIDERS } from '@/lib/types';
import { AiProviderDropdown } from './ai-provider-dropdown';
import AddDataButton from '@/components/ui/add-data-button';

interface SidebarProps {
  onNewChat: () => void;
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

export function Sidebar({ onNewChat, selectedProvider, onProviderChange }: SidebarProps) {
  return (
    <div className="chatgpt-sidebar flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-3">
        <AddDataButton onClick={onNewChat} />
      </div>

      {/* AI Provider Selection */}
      <div className="px-3 pb-3">
        <AiProviderDropdown
          selectedProvider={selectedProvider}
          onProviderChange={onProviderChange}
          availableProviders={AI_PROVIDERS}
        />
      </div>

      {/* Chat History (placeholder for now) */}
      <div className="flex-1 overflow-y-auto px-3">
        {/* This would contain chat history items */}
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-700">
        <Button
          onClick={onNewChat}
          className="chatgpt-clear-button w-full justify-start h-10 px-3"
          variant="outline"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear conversations
        </Button>
      </div>
    </div>
  );
}