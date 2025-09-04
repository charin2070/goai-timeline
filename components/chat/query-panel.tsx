import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Trash2 } from "lucide-react";
import DropButton from '@/components/ui/drop-button';
import { AttachDropdown } from '@/components/attach-dropdown';
import { AiProviderDropdown } from "./ai-provider-dropdown";
import { useAIProviderContext } from "@/lib/ai-provider-context";

// Define the QueryPanel component

interface QueryPanelProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  onClearChat: () => void;
  onEditMessage?: (messageId: string) => void;
  onLogFileUpload?: () => void;
  onLogPaste?: () => void;
  onChatFileUpload?: () => void;
  onChatPaste?: () => void;
}

export interface QueryPanelRef {
  setInputValue: (value: string) => void;
}

const QueryPanel = forwardRef<QueryPanelRef, QueryPanelProps>(({ onSendMessage, placeholder, onClearChat, onLogFileUpload, onLogPaste, onChatFileUpload, onChatPaste }: QueryPanelProps, ref) => {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { selectedProvider, changeProvider, availableProviders } = useAIProviderContext();

  useImperativeHandle(ref, () => ({
    setInputValue,
  }));

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-black bg-opacity-50 backdrop-blur-md ring-1 ring-gray-800 hover:ring-gray-700 focus-within:ring-gray-700 hover:focus-within:ring-gray-700 relative w-full overflow-hidden shadow shadow-black/10 rounded-3xl p-3 transition-all duration-100 ease-in-out flex flex-col max-w-2xl mx-auto">
      <div className="relative z-10 mb-12">
        <textarea
          dir="auto"
          aria-label="Опишите детали..."
          className="w-full px-3 pt-5 bg-transparent focus:outline-none text-gray-200 align-bottom resize-none h-11 text-sm"
          style={{ height: "44px" }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />

      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AttachDropdown
            onLogFileUpload={onLogFileUpload}
            onChatFileUpload={onChatFileUpload}
            className="text-gray-400 hover:text-white"
          />
          <Button variant="ghost" size="icon" onClick={onClearChat} className="text-gray-400 hover:text-white">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex flex-row items-end gap-1">
          <AiProviderDropdown
            selectedProvider={selectedProvider}
            onProviderChange={changeProvider}
            availableProviders={availableProviders}
            compact={true}
            showStatus={false}
            className="w-40"
          />
          <DropButton 
            label=""
            width="46px"
            height="46px"
            bgColor="transparent"
            textColor="gray-200"
            icon={Send}
            iconWidth="56px"
            iconHeight="56px"
            onClick={handleSendMessage} 
          />
        </div>
      </div>
    </div>
  );
});

QueryPanel.displayName = 'QueryPanel';

export default QueryPanel;