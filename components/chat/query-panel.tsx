import React, { useState, useImperativeHandle, forwardRef, useRef, useEffect } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedProvider, changeProvider, availableProviders } = useAIProviderContext();

  useImperativeHandle(ref, () => ({
    setInputValue: (value: string) => {
      setInputValue(value);
    },
  }));

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

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
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <textarea
          ref={textareaRef}
          dir="auto"
          aria-label="Опишите детали..."
          className="w-full px-3 pr-4 pt-5 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none text-gray-200 align-bottom resize-none text-sm"
          style={{ maxHeight: "200px" }}
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <AttachDropdown
            onLogFileUpload={onLogFileUpload}
            onChatFileUpload={onChatFileUpload}
            className="text-gray-400 hover:text-white"
          />
          <Button variant="ghost" size="icon" onClick={onClearChat} className="text-gray-400 hover:text-white">
            <Trash2 className="w-4 h-4" />
          </Button>
          <AiProviderDropdown
            selectedProvider={selectedProvider}
            onProviderChange={changeProvider}
            availableProviders={availableProviders}
            compact={true}
            showStatus={false}
            className="w-40"
          />
        </div>
        <div className="flex flex-row items-end gap-1">
          <DropButton 
            label=""
            width="36px"
            height="36px"
            bgColor="transparent"
            textColor="gray-200"
            icon={Send}
            iconWidth="46px"
            iconHeight="46px"
            onClick={handleSendMessage} 
          />
        </div>
      </div>
    </div>
  );
});

QueryPanel.displayName = 'QueryPanel';

export default QueryPanel;