'use client';

import { useRef } from 'react';
import { useFileContext } from '@/lib/file-context';
import { Button } from '@/components/ui/button';
import { PlusCircle, X, FileText, Image, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFileType } from '@/lib/utils';

export function FileSidebar() {
  const { files, selectedFile, addFile, removeFile, selectFile } = useFileContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newFile = {
          id: Date.now().toString(),
          name: file.name,
          content,
        };
        addFile(newFile);
      };
      reader.readAsText(file);
    }
  };

  const getFileIcon = (fileName: string) => {
    const fileType = getFileType(fileName);
    switch (fileType) {
      case 'image':
        return <Image className="w-4 h-4 mr-2" />;
      case 'audio':
        return <Music className="w-4 h-4 mr-2" />;
      case 'log':
        return <FileText className="w-4 h-4 mr-2" />;
      default:
        return <FileText className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="flex flex-col h-full bg-gray-900/70 backdrop-blur-lg text-white p-4 w-64 border-r border-gray-800"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Файлы</h2>
        <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
          <Button variant="ghost" size="icon" onClick={handleAddFileClick}>
            <PlusCircle className="w-5 h-5" />
          </Button>
        </motion.div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul>
          <AnimatePresence>
            {files.map(file => (
              <motion.li
                key={file.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between"
              >
                <Button
                  variant={selectedFile?.id === file.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start mb-2 overflow-hidden text-ellipsis whitespace-nowrap"
                  onClick={() => selectFile(file.id)}
                >
                  {getFileIcon(file.name)}
                  <span className="truncate">{file.name}</span>
                </Button>
                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </motion.div>
  );
}