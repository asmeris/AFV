import React, { useState, useEffect } from 'react';

// Declaration for the global aistudio object
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (selected) {
        onKeySelected();
      }
    }
    setLoading(false);
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success after closing dialog (race condition mitigation)
        setHasKey(true);
        onKeySelected();
      } catch (e) {
        console.error("Key selection failed or cancelled", e);
      }
    } else {
        alert("AI Studio environment not detected. This app requires the AI Studio environment.");
    }
  };

  if (loading) return <div className="text-center p-4 text-gray-400">Checking permissions...</div>;

  if (hasKey) return null; // Render nothing if key is selected

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-card-bg border border-aura-purple/30 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(139,92,246,0.2)]">
        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-aura-purple to-aura-cyan">
          Aura Access Required
        </h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          To generate high-quality Aura Videos using Google Veo, you must provide a valid API key with billing enabled.
        </p>
        
        <div className="mb-6 bg-dark-bg p-4 rounded-lg border border-white/10 text-sm text-left">
           <p className="text-gray-400 mb-2">💡 <strong>Note:</strong></p>
           <ul className="list-disc list-inside text-gray-400 space-y-1">
             <li>Video generation is a resource-intensive process.</li>
             <li>You must select a project with billing enabled.</li>
             <li><a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-aura-cyan hover:underline">Read Billing Docs</a></li>
           </ul>
        </div>

        <button
          onClick={handleSelectKey}
          className="w-full py-4 px-6 bg-gradient-to-r from-aura-purple to-aura-cyan hover:from-aura-purple/80 hover:to-aura-cyan/80 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
        >
          Select API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeySelector;