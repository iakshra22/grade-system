'use client';

import React from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm saas-fade-in">
      <div className="relative w-full max-w-sm rounded-lg border border-zinc-800 bg-[#09090b] p-5 shadow-2xl overflow-hidden">
        
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mt-1 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-red-950/40 border border-red-900/30 text-red-400 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
          <p className="mt-2 text-xs text-zinc-400 leading-normal px-2">
            {message}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="saas-btn-secondary py-1.5 px-3 text-xs"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="saas-btn-danger py-1.5 px-3 text-xs"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
