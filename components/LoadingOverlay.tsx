import React, { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  auraColor: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ auraColor }) => {
  const [dots, setDots] = useState('');
  const [message, setMessage] = useState('Gathering Spirit Energy');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const msgInterval = setInterval(() => {
        const msgs = [
            "Gathering Spirit Energy",
            "Manifesting Aura",
            "Rendering Particles",
            "Calculating Coolness Factor",
            "Applying Anime Filters",
            "Increasing Aura Points"
        ];
        setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    }, 4000);

    return () => {
        clearInterval(interval);
        clearInterval(msgInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
      <div className={`relative w-32 h-32 mb-8`}>
        {/* Core */}
        <div className={`absolute inset-0 bg-gradient-to-br ${auraColor} rounded-full blur-xl opacity-50 animate-pulse`}></div>
        <div className="absolute inset-4 bg-white rounded-full opacity-80 animate-ping"></div>
        <div className={`absolute inset-0 border-4 border-white/20 rounded-full animate-[spin_3s_linear_infinite]`}></div>
      </div>
      
      <h3 className="text-2xl font-bold text-white tracking-widest uppercase mb-2">
        {message}{dots}
      </h3>
      <p className="text-gray-400 text-sm max-w-xs text-center">
        This ritual may take 1-2 minutes. Do not close the tab.
      </p>
    </div>
  );
};

export default LoadingOverlay;
