'use client';

import { useState, useRef } from 'react';
import { useFileContext } from '@/lib/file-context';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { light, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';
import { getFileType, filterLogErrors } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import QueryPanel, { QueryPanelRef } from './query-panel';
import { FileSidebar } from './file-sidebar';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { useChatFunctions } from '@/lib/chat-functions-context';

export function RightSidebar() {
  const { onSendMessage, onClearChat } = useChatFunctions();
  const { selectedFile } = useFileContext();
  const [selectedOS, setSelectedOS] = useState('Linux');
  const [selectedApp, setSelectedApp] = useState('.NET application');
  const [isOptimized, setIsOptimized] = useState(false);
  const queryPanelRef = useRef<QueryPanelRef>(null);

  const getLanguage = (fileName: string) => {
    const fileType = getFileType(fileName);
    switch (fileType) {
      case 'log':
        return 'log';
      default:
        return 'xml';
    }
  };

  const getStyle = (fileName: string) => {
    const fileType = getFileType(fileName);
    switch (fileType) {
      case 'log':
        return atomOneLight;
      default:
        return light;
    }
  };

  const displayedContent = selectedFile 
    ? (isOptimized && getFileType(selectedFile.name) === 'log' 
        ? filterLogErrors(selectedFile.content) 
        : selectedFile.content)
    : '';

  const generatePAMLPrompt = () => {
    let prompt = '<PAML>';
    prompt += `  <OS>${selectedOS}</OS>`;
    prompt += `  <Application>${selectedApp}</Application>`;
    prompt += `  <LogContent>
${displayedContent}
  </LogContent>`;
    prompt += '</PAML>';
    return prompt;
  };

  const handleCopyPrompt = () => {
    const promptContent = generatePAMLPrompt();
    navigator.clipboard.writeText(promptContent);
    if (queryPanelRef.current) {
      queryPanelRef.current.setInputValue(promptContent);
    }
    toast.success('Промпт скопирован в поле ввода');
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="flex flex-col h-full bg-gray-900/70 backdrop-blur-lg text-white p-4 border-l border-gray-800"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Файл</h2>
        <div className="flex items-center gap-2">
          <Button>Добавить</Button>
          <Button onClick={() => setIsOptimized(!isOptimized)}>{isOptimized ? 'Показать все' : 'Оптимизировать'}</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-black">{selectedOS}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setSelectedOS('Linux')} className={selectedOS === 'Linux' ? 'text-black' : ''}>Linux</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSelectedOS('Windows')} className={selectedOS === 'Windows' ? 'text-black' : ''}>Windows</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSelectedOS('MacOS')} className={selectedOS === 'MacOS' ? 'text-black' : ''}>MacOS</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setSelectedOS('Android')} className={selectedOS === 'Android' ? 'text-black' : ''}>Android</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSelectedOS('iOS')} className={selectedOS === 'iOS' ? 'text-black' : ''}>iOS</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-black">{selectedApp}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setSelectedApp('.NET application')} className={selectedApp === '.NET application' ? 'text-black' : ''}>.NET application</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSelectedApp('JAVA application')} className={selectedApp === 'JAVA application' ? 'text-black' : ''}>JAVA application</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSelectedApp('C++ application')} className={selectedApp === 'C++ application' ? 'text-black' : ''}>C++ application</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setSelectedApp('nGinx')} className={selectedApp === 'nGinx' ? 'text-black' : ''}>nGinx</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSelectedApp('IIS')} className={selectedApp === 'IIS' ? 'text-black' : ''}>IIS</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Tabs defaultValue="fileContent" className="flex flex-col flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fileContent">Содержимое файла</TabsTrigger>
          <TabsTrigger value="finalPrompt" className="flex items-center gap-1">
            Итоговый промпт
            <Button variant="ghost" size="icon" onClick={handleCopyPrompt} className="h-6 w-6">
              <Copy className="h-4 w-4" />
            </Button>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fileContent" className="flex-1 overflow-y-auto bg-gray-900 rounded-lg flex flex-col">
          <div className="h-1/2">
            <FileSidebar />
          </div>
          <div className="h-1/2">
            {selectedFile ? (
              <SyntaxHighlighter 
                language={getLanguage(selectedFile.name)} 
                style={getStyle(selectedFile.name)} 
                customStyle={{ background: 'transparent', width: '100%', textShadow: 'none' }}
                wrapLines={true}
                wrapLongLines={true}
                className="right-sidebar-syntax-highlighter"
              >
                {displayedContent}
              </SyntaxHighlighter>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a file to view its content</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="finalPrompt" className="flex-1 overflow-y-auto bg-gray-900 rounded-lg p-4">
          <textarea
            className="w-full h-full bg-transparent text-white focus:outline-none resize-none"
            readOnly
            value={generatePAMLPrompt()}
          />
        </TabsContent>
      </Tabs>
      <div className="mt-4">
        <QueryPanel 
          ref={queryPanelRef}
          placeholder='Отправить промпт в AI...'
          onSendMessage={onSendMessage}
          onClearChat={onClearChat}
        />
      </div>
    </motion.div>
  );
}
