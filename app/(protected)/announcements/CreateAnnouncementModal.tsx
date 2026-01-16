"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import CreateAnnouncementForm from "./new/CreateAnnouncementForm";

interface Props {
    canCreateSchool: boolean;
    canCreateClass: boolean;
}

export default function CreateAnnouncementModal({ canCreateSchool, canCreateClass }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow transition-colors flex items-center gap-2"
            >
                <Plus size={20} />
                <span className="hidden md:inline">Nuovo Avviso</span>
            </button>

            <Modal 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)} 
                title="Nuovo Avviso"
            >
                <CreateAnnouncementForm 
                    canCreateSchool={canCreateSchool}
                    canCreateClass={canCreateClass}
                    onSuccess={() => setIsOpen(false)}
                />
            </Modal>
        </>
    );
}
