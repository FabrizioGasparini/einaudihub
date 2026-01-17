"use client";

import Modal from "./Modal";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    buttonText?: string;
    type?: 'success' | 'error' | 'info';
}

export default function AlertModal({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    buttonText = "OK",
    type = 'info'
}: AlertModalProps) {
    const colors = {
        info: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
        error: "bg-red-500 hover:bg-red-600 shadow-red-200",
        success: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={title}
            footer={
                <button 
                    onClick={onClose}
                    className={`w-full px-5 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-transform active:scale-95 ${colors[type]}`}
                >
                    {buttonText}
                </button>
            }
        >
            <div className="py-2">
                <p className="text-gray-600 font-medium leading-relaxed">{message}</p>
            </div>
        </Modal>
    );
}
