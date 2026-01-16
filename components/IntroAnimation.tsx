"use client";

import { useEffect, useState } from 'react';

export default function IntroAnimation() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide after animation duration
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2500); // 2.5s total duration
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white pointer-events-none animate-outro-fade">
      <div className="relative">
        {/* Animated Background Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Text Animation */}
        <div className="relative z-10 text-center">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-text-reveal overflow-clip">
                EINAUDIHUB
            </h1>
            <p className="mt-4 text-gray-500 font-medium tracking-widest uppercase text-sm animate-slide-up opacity-0" style={{animationFillMode: 'forwards', animationDelay: '0.5s'}}>
                Il Social del tuo Istituto
            </p>
        </div>
      </div>
    </div>
  );
}
