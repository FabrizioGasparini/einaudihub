import { Badge } from "lucide-react";

export type RoleType = "ADMIN" | "MODERATOR" | "SCHOOL_REP" | "CLASS_REP" | "STUDENT";

interface UserRoleBadgeProps {
  role: RoleType;
  className?: string;
}

const roleConfig: Record<RoleType, { label: string; color: string; bg: string }> = {
  ADMIN: { label: "Admin", color: "text-purple-700", bg: "bg-purple-100 border-purple-200" },
  MODERATOR: { label: "Mod", color: "text-orange-700", bg: "bg-orange-100 border-orange-200" },
  SCHOOL_REP: { label: "Rapp. Istituto", color: "text-red-700", bg: "bg-red-100 border-red-200" },
  CLASS_REP: { label: "Rapp. Classe", color: "text-green-700", bg: "bg-green-100 border-green-200" },
  STUDENT: { label: "Studente", color: "text-gray-600", bg: "bg-gray-100 border-gray-200" },
};

export default function UserRoleBadge({ role, className = "" }: UserRoleBadgeProps) {
  const config = roleConfig[role] || roleConfig.STUDENT;

  if (role === 'STUDENT') return null; // Usually we don't badge students to reduce noise

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${config.bg} ${config.color} ${className}`}>
      {config.label}
    </span>
  );
}