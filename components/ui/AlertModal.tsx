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
    let buttonColor = "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
    if (type === 'error') buttonColor = "bg-red-600 hover:bg-red-700 focus:ring-red-500";
    if (type === 'success') buttonColor = "bg-green-600 hover:bg-green-700 focus:ring-green-500";

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={title}
            footer={
                <button 
                    onClick={onClose}
                    className={`w-full px-4 py-2 text-sm font-bold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${buttonColor}`}
                >
                    {buttonText}
                </button>
            }
        >
            <div className="py-2">
                <p className="text-gray-600">{message}</p>
            </div>
        </Modal>
    );
}
