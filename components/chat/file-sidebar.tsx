'use client';

import { useRef } from 'react';
import { useFileContext } from '@/lib/file-context';
import { Button } from '@/components/ui/button';
import {
  PlusCircle, X, FileText, Image, Music, Terminal, AppWindow, Apple, Smartphone, Code, Server, Database, User, Globe, Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFileType } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

export function FileSidebar() {
  const { files, selectedFile, addFile, removeFile, selectFile, updateFile } = useFileContext();
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
    <div className="flex flex-col h-full p-4 bg-background">
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
                className="flex flex-col items-start p-2 rounded-lg mb-2 bg-card"
              >
                <div className="flex items-center justify-between w-full">
                  <Button
                    variant={selectedFile?.id === file.id ? 'secondary' : 'ghost'}
                    className="flex-1 justify-start overflow-hidden text-ellipsis whitespace-nowrap"
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
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 w-full">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" className="w-full">{file.os}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent asChild>
                      <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="hidden">
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { os: 'Linux' })}><motion.div variants={itemVariants} className="flex items-center"><Terminal className="w-4 h-4 mr-2"/>Linux</motion.div></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { os: 'Windows' })}><motion.div variants={itemVariants} className="flex items-center"><AppWindow className="w-4 h-4 mr-2"/>Windows</motion.div></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { os: 'MacOS' })}><motion.div variants={itemVariants} className="flex items-center"><Apple className="w-4 h-4 mr-2"/>MacOS</motion.div></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { os: 'Android' })}><motion.div variants={itemVariants} className="flex items-center"><Smartphone className="w-4 h-4 mr-2"/>Android</motion.div></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { os: 'iOS' })}><motion.div variants={itemVariants} className="flex items-center"><Smartphone className="w-4 h-4 mr-2"/>iOS</motion.div></DropdownMenuItem>
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" className="w-full">{file.app}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent asChild>
                      <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="hidden">
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { app: '.NET application' })}><motion.div variants={itemVariants} className="flex items-center"><Code className="w-4 h-4 mr-2"/>.NET application</motion.div></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { app: 'JAVA application' })}><motion.div variants={itemVariants} className="flex items-center"><Code className="w-4 h-4 mr-2"/>JAVA application</motion.div></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { app: 'C++ application' })}><motion.div variants={itemVariants} className="flex items-center"><Code className="w-4 h-4 mr-2"/>C++ application</motion.div></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { app: 'nGinx' })}><motion.div variants={itemVariants} className="flex items-center"><Server className="w-4 h-4 mr-2"/>nGinx</motion.div></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { app: 'IIS' })}><motion.div variants={itemVariants} className="flex items-center"><Server className="w-4 h-4 mr-2"/>IIS</motion.div></DropdownMenuItem>
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" className="w-full">{file.server}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent asChild>
                      <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="hidden">
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { server: 'Frontend' })}><motion.div variants={itemVariants} className="flex items-center"><Monitor className="w-4 h-4 mr-2"/>Frontend</motion.div></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { server: 'Middle' })}><motion.div variants={itemVariants} className="flex items-center"><Server className="w-4 h-4 mr-2"/>Middle</motion.div></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { server: 'Backend' })}><motion.div variants={itemVariants} className="flex items-center"><Server className="w-4 h-4 mr-2"/>Backend</motion.div></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { server: 'DB' })}><motion.div variants={itemVariants} className="flex items-center"><Database className="w-4 h-4 mr-2"/>DB</motion.div></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { server: 'Client' })}><motion.div variants={itemVariants} className="flex items-center"><User className="w-4 h-4 mr-2"/>Client</motion.div></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFile(file.id, { server: 'External service' })}><motion.div variants={itemVariants} className="flex items-center"><Globe className="w-4 h-4 mr-2"/>External service</motion.div></DropdownMenuItem>
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
