"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Shield, ChevronUp, ChevronDown } from "lucide-react"

const TEST_USERS = [
  { email: "gasparini.fabrizio@einaudicorreggio.it", label: "Fabrizio Gasparini", role: "Admin" },
  { email: "student@test.com", label: "Studente (1A)", role: "Student" },
  { email: "rep@test.com", label: "Rappresentante (1A)", role: "Class Rep" },
  { email: "schoolrep@test.com", label: "Rappresentante d'Istituto", role: "School Rep" },
  { email: "admin@test.com", label: "Admin", role: "Admin" },
]

export default function DevUserSwitcher() {
  const [isOpen, setIsOpen] = useState(false)

  // Explicit check to avoid rendering in production builds even if conditional logic exists elsewhere
  // (though the bundler might not treeshake this based on env without specific config, 
  // keeping it handled at runtime is safer for now)
  if (process.env.NODE_ENV !== "development") return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 bg-gray-900 text-white p-4 rounded-xl shadow-2xl border border-gray-700 w-64 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Switch User</h3>
            <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">DEV ONLY</span>
          </div>
          <div className="space-y-2">
            {TEST_USERS.map((u) => (
              <button
                key={u.email}
                onClick={() => signIn("credentials", { email: u.email, callbackUrl: "/home" })}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-all border border-transparent hover:border-gray-600 group"
              >
                <div className="text-sm font-medium">{u.label}</div>
                <div className="text-xs text-gray-500 group-hover:text-gray-400">{u.email}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full bg-gray-900 border border-gray-700 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform hover:bg-gray-800"
        title="Dev Tools"
      >
        {isOpen ? <ChevronDown size={20} /> : <Shield size={20} className="text-red-400" />}
      </button>
    </div>
  )
}
