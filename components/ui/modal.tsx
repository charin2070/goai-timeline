// components/ui/modal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface ModalHeaderProps {
  children: React.ReactNode;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ children }) => {
  return <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">{children}</div>;
};

interface ModalTitleProps {
  children: React.ReactNode;
}

const ModalTitle: React.FC<ModalTitleProps> = ({ children }) => {
  return <h2 className="text-lg font-semibold text-gray-900">{children}</h2>;
};

interface ModalBodyProps {
  children: React.ReactNode;
}

const ModalBody: React.FC<ModalBodyProps> = ({ children }) => {
  return <div className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-[500px] transition-all duration-300 ease-in-out">{children}</div>;
};

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
  return <div className={clsx("flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white", className)}>{children}</div>;
};

interface ModalComponent extends React.FC<ModalProps> {
  Header: React.FC<ModalHeaderProps>;
  Title: React.FC<ModalTitleProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
}

const ModalBase: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-xl shadow-2xl transform transition-all duration-300 scale-100 overflow-hidden">
        {children}
      </div>
    </div>
  );

  // Use Portal to render modal at the root level
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

const Modal = ModalBase as ModalComponent;

Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;