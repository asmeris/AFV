import React, { useState, useRef } from 'react';
import { AURA_PRESETS, SAMPLE_PROMPTS } from './constants';
import { AuraType, AspectRatio, GenerationConfig, AppState, VideoResult, TransformationType } from './types';
import { generateAuraVideo } from './services/geminiService';
import ApiKeySelector from './components/ApiKeySelector';
import LoadingOverlay from './components/LoadingOverlay';

const App: React.FC = () => {
  // State
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedAura, setSelectedAura] = useState<AuraType>(AuraType.DIVINE_GOLD);
  const [prompt, setPrompt] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [transformationType, setTransformationType] = useState<TransformationType>(TransformationType.NONE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to process file (used by both input change and drop)
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert("Please upload a valid image file (PNG, JPEG, WebP).");
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size too large. Please use an image under 5MB.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleGenerate = async () => {
    if (!apiKeyReady) {
        alert("API Key required.");
        return;
    }

    setAppState(AppState.GENERATING);
    setErrorMsg(null);
    setVideoResult(null);

    try {
      const config: GenerationConfig = {
        prompt,
        auraType: selectedAura,
        aspectRatio,
        transformationType,
      };

      if (imageFile) {
        config.imageBase64 = await blobToBase64(imageFile);
        config.imageMimeType = imageFile.type;
      }

      const result = await generateAuraVideo(config);
      setVideoResult(result);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Unknown error occurred during generation.");
      setAppState(AppState.ERROR);
    }
  };

  const handleRetryKey = async () => {
      if (window.aistudio) {
          try {
             // Reset internal state logic if needed, but mainly just re-open dialog
             await window.aistudio.openSelectKey(); 
             // Once selected, we can try generating again or just stay ready
             setApiKeyReady(true);
          } catch(e) {
              console.error(e);
          }
      }
  };

  // Render Helpers
  const renderHeader = () => (
    <header className="mb-8 text-center space-y-2">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-aura-purple via-aura-cyan to-aura-gold animate-glow p-2">
            AURA FARMING
        </h1>
        <p className="text-gray-400 text-lg">Visual Effect Generator • Veo 3.1</p>
    </header>
  );

  const renderAuraSelector = () => (
    <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-3 uppercase tracking-wider">Select Aura Style</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(AURA_PRESETS) as AuraType[]).map((type) => {
                const preset = AURA_PRESETS[type];
                const isSelected = selectedAura === type;
                return (
                    <button
                        key={type}
                        onClick={() => setSelectedAura(type)}
                        className={`
                            relative p-4 rounded-xl border transition-all duration-300 text-left overflow-hidden group
                            ${isSelected ? `border-${preset.color.split(' ')[1]} bg-white/5 ring-1 ring-white/20` : 'border-white/5 bg-card-bg hover:bg-white/5'}
                        `}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${preset.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{preset.icon}</span>
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_10px_white]"></div>}
                        </div>
                        <h3 className="font-bold text-white text-sm">{type}</h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{preset.description}</p>
                    </button>
                )
            })}
        </div>
    </div>
  );

  const renderImageUpload = () => (
    <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-3 uppercase tracking-wider">Source Material (Optional)</label>
        <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`
                border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                ${imagePreview 
                    ? 'border-aura-purple bg-black/20' 
                    : isDragging
                        ? 'border-aura-cyan bg-aura-cyan/10 scale-[1.01] shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : 'border-gray-700 hover:border-gray-500 hover:bg-white/5'
                }
            `}
        >
            {imagePreview ? (
                <div className="relative w-full h-full p-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleClearImage(); }}
                        className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            ) : (
                <div className="text-center p-6 pointer-events-none">
                    <div className={`mx-auto h-12 w-12 mb-3 transition-colors ${isDragging ? 'text-aura-cyan' : 'text-gray-400'}`}>
                        {isDragging ? (
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                             </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        )}
                    </div>
                    <p className={`font-medium transition-colors ${isDragging ? 'text-aura-cyan' : 'text-gray-300'}`}>
                        {isDragging ? "Drop to Infuse Energy" : "Click or Drag Photo Here"}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">For best aura results, use a full body or portrait shot</p>
                </div>
            )}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={handleImageUpload}
            />
        </div>
    </div>
  );

  const renderControls = () => (
    <div className="mb-8 space-y-6">
        {/* Aspect Ratio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                 <label className="block text-sm font-medium text-gray-300 mb-3 uppercase tracking-wider">Format</label>
                 <div className="flex gap-4">
                     <button 
                        onClick={() => setAspectRatio(AspectRatio.PORTRAIT)}
                        className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-all ${aspectRatio === AspectRatio.PORTRAIT ? 'bg-aura-purple border-transparent text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                     >
                        📱 Story (9:16)
                     </button>
                     <button 
                        onClick={() => setAspectRatio(AspectRatio.LANDSCAPE)}
                        className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-all ${aspectRatio === AspectRatio.LANDSCAPE ? 'bg-aura-cyan border-transparent text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                     >
                        🎬 Cinematic (16:9)
                     </button>
                 </div>
            </div>

            {/* Transformation / Gender Swap */}
            <div>
                 <label className="block text-sm font-medium text-gray-300 mb-3 uppercase tracking-wider">Transformation</label>
                 <div className="flex gap-2">
                     <button 
                        onClick={() => setTransformationType(TransformationType.NONE)}
                        className={`flex-1 py-3 px-2 rounded-lg border text-sm font-bold transition-all ${transformationType === TransformationType.NONE ? 'bg-gray-600 border-transparent text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                     >
                        None
                     </button>
                     <button 
                        onClick={() => setTransformationType(TransformationType.MALE_TO_FEMALE)}
                        className={`flex-1 py-3 px-2 rounded-lg border text-sm font-bold transition-all ${transformationType === TransformationType.MALE_TO_FEMALE ? 'bg-pink-600 border-transparent text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                     >
                        ♂️ ➔ ♀️
                     </button>
                     <button 
                        onClick={() => setTransformationType(TransformationType.FEMALE_TO_MALE)}
                        className={`flex-1 py-3 px-2 rounded-lg border text-sm font-bold transition-all ${transformationType === TransformationType.FEMALE_TO_MALE ? 'bg-blue-600 border-transparent text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                     >
                        ♀️ ➔ ♂️
                     </button>
                 </div>
            </div>
        </div>

        {/* Prompt Input */}
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-3 uppercase tracking-wider">
                Vibe Description (Optional)
            </label>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the action or specific details (e.g., 'Eyes glowing red, ground cracking beneath feet')..."
                className="w-full bg-card-bg border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-aura-cyan focus:border-transparent outline-none transition-all resize-none h-24 placeholder-gray-600"
            />
            {/* Quick Prompts */}
            <div className="mt-3 flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.slice(0, 3).map((p, i) => (
                    <button 
                        key={i}
                        onClick={() => setPrompt(p)}
                        className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 py-1 px-3 rounded-full transition-colors border border-white/5"
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-aura-purple selection:text-white">
      <ApiKeySelector onKeySelected={() => setApiKeyReady(true)} />
      
      {appState === AppState.GENERATING && <LoadingOverlay auraColor={AURA_PRESETS[selectedAura].color} />}

      <div className="max-w-4xl mx-auto px-4 py-12">
        {renderHeader()}

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Controls */}
            <div className="lg:col-span-7 space-y-8">
                {renderImageUpload()}
                {renderAuraSelector()}
                {renderControls()}

                <button
                    onClick={handleGenerate}
                    disabled={appState === AppState.GENERATING || !apiKeyReady}
                    className={`
                        w-full py-5 rounded-2xl font-bold text-lg uppercase tracking-widest shadow-lg transition-all transform active:scale-95
                        ${appState === AppState.GENERATING 
                            ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                            : 'bg-gradient-to-r from-aura-purple via-pink-600 to-aura-gold hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] text-white'
                        }
                    `}
                >
                    {appState === AppState.GENERATING ? 'Generating...' : 'Manifest Aura'}
                </button>

                {errorMsg && (
                    <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 mt-4 text-sm flex flex-col gap-2">
                        <span>Error: {errorMsg}</span>
                        {errorMsg.includes("Requested entity was not found") && (
                             <button onClick={handleRetryKey} className="text-red-400 underline hover:text-red-300 text-left">
                                 Your API Key might be invalid or project deleted. Click here to select a new key.
                             </button>
                        )}
                    </div>
                )}
            </div>

            {/* Right Column: Preview/Result */}
            <div className="lg:col-span-5 space-y-6">
                <div className="sticky top-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-300 flex items-center gap-2">
                        <span>Output</span>
                        <div className="h-px bg-gray-700 flex-grow"></div>
                    </h2>
                    
                    <div className="aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative group">
                        {videoResult ? (
                            <div className="w-full h-full relative">
                                <video 
                                    src={videoResult.uri} 
                                    controls 
                                    autoPlay 
                                    loop 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-aura-gold border border-aura-gold/30">
                                    AURA: +9999
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 p-8 text-center bg-card-bg/50">
                                <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center mb-4">
                                    <span className="text-3xl">🎬</span>
                                </div>
                                <p className="text-sm">Your legendary aura video will appear here.</p>
                                {imagePreview && (
                                    <div className="mt-4 text-xs text-gray-500">
                                        Source image loaded. Ready to transform.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {videoResult && (
                        <a
                            href={videoResult.uri}
                            download="aura_video.mp4"
                            target="_blank"
                            rel="noreferrer"
                            className="block mt-4 w-full py-3 bg-white/10 hover:bg-white/20 text-white text-center rounded-xl font-medium transition-colors border border-white/10"
                        >
                            Download Video
                        </a>
                    )}
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;