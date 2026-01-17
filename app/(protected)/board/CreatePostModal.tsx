"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { CreatePostForm } from "./new/create-post-form";

interface Props {
    categories: { id: string, name: string }[];
    user: { classId?: string | null };
    permissions: {
        canCreatePost: boolean;
        canCreateAnnouncement: boolean;
        canCreateEvent: boolean;
        canCreatePoll: boolean;
    };
}

export default function CreatePostModal({ categories, user, permissions }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-lg"
                title="Crea nuovo post"
            >
                <Plus size={20} />
            </button>

            <Modal 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)} 
                title="Nuovo Post"
            >
                <div className="max-h-[80vh] overflow-y-auto pr-2">
                    <CreatePostForm 
                        categories={categories}
                        user={user}
                        permissions={permissions}
                        onSuccess={() => setIsOpen(false)}
                    />
                </div>
            </Modal>
        </>
    );
}
