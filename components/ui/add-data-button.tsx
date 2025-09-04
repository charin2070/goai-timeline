import React from 'react';
import { Clipboard } from 'lucide-react';

interface AddDataButtonProps {
  onClick?: () => void;
}

const AddDataButton: React.FC<AddDataButtonProps> = ({ onClick }) => {
  return (
    <div className="flex items-center w-full">
      <button
        onClick={onClick}
        className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-l-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <span className="text-lg font-bold">+</span>
        Добавить файл
      </button>
      <button
        onClick={onClick}
        className="w-1/5 bg-blue-500 text-white py-3 px-4 rounded-r-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
      >
        <Clipboard className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AddDataButton;
