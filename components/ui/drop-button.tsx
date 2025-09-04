import { Button } from "@/components/ui/button";
import { ChevronDown, FileText } from "lucide-react";
import React from "react";

interface DropButtonProps {
    width?: string;
    height?: string;
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
    iconWidth?: string;
    iconHeight?: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}

const DropButton: React.FC<DropButtonProps> = ({ label, icon: Icon, onClick, width, height, bgColor, textColor, borderColor, iconWidth, iconHeight }) => {
  return (
    <button
      onClick={onClick}
      style={{ width, height, backgroundColor: bgColor, color: textColor, borderColor }}
      className="rounded-full pl-3 pr-3 bg-black bg-opacity-60 backdrop-blur-md hover:bg-gray-700 hover:bg-opacity-80 transition-all duration-200 ease-in-out flex items-center text-gray-300 text-sm transform hover:scale-120 hover:shadow-lg active:scale-95 active:shadow-white active:shadow-sm active:shadow-opacity-50 active:bg-gray-100"
    >
      <Icon className="mr-1" style={{ width: iconWidth, height: iconHeight }} />
      <span>{label}</span>
    </button>
  );
};

export default DropButton;
