import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-30">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col relative">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}