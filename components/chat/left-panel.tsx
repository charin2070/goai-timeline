'use client';

import { FileSidebar } from './file-sidebar';

export function LeftPanel() {
  return (
    <div className="flex flex-col h-full p-4 bg-gray-800/50">
      <h2 className="text-lg font-semibold mb-4">Логи</h2>
      <FileSidebar />
    </div>
  );
}
