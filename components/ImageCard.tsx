import React, { useState } from 'react';
import { GeneratedImage, JewelryConfig } from '../types';
import { Icons } from '../constants';

interface ImageCardProps {
  img: GeneratedImage;
  isCoolingDown: boolean;
  onOpenLightbox: (img: GeneratedImage) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onQuickSave: (img: GeneratedImage) => void;
  onGenerate: (config: JewelryConfig) => void;
  onExport: (img: GeneratedImage) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  img,
  isCoolingDown,
  onOpenLightbox,
  onToggleSave,
  onQuickSave,
  onGenerate,
  onExport,
}) => {
  const [variationInput, setVariationInput] = useState('');

  const handleGenerateVariation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!img.config || isCoolingDown) return;

    const newConfig = { ...img.config };
    if (variationInput.trim()) {
        // Append the new variation prompt to the existing miscPrompts
        newConfig.miscPrompts = (newConfig.miscPrompts ? newConfig.miscPrompts + ', ' : '') + variationInput.trim();
    }
    
    onGenerate(newConfig);
    setVariationInput(''); // Clear input after triggering
  };

  // Loading Skeleton
  if (img.status === 'loading') {
    return (
        <div className="aspect-square bg-white/5 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center group rounded-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-full h-full animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
            <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-4"></div>
            <p className="text-emerald-400/80 text-[10px] tracking-[0.2em] uppercase font-light z-10 animate-pulse">Processing...</p>
        </div>
    );
  }

  return (
    <div 
        onClick={() => onOpenLightbox(img)}
        className="group relative aspect-square bg-neutral-900 border border-white/5 overflow-hidden cursor-zoom-in hover:border-emerald-500/50 transition-all duration-500 shadow-2xl shadow-black/50 rounded-sm"
    >
        <img 
            src={img.url} 
            alt="Variation" 
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
        
        {/* Overlay with Tags, Input and Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
            
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                
                {/* Variation Input Field */}
                <div 
                    className="mb-3 flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()} 
                >
                    <input 
                        type="text" 
                        value={variationInput}
                        onChange={(e) => setVariationInput(e.target.value)}
                        placeholder="Modify design... (e.g. add red ruby)"
                        className="flex-1 bg-white/10 border border-white/20 rounded-sm px-2 py-1.5 text-[10px] text-white placeholder-neutral-400 focus:border-emerald-500 focus:bg-black/50 outline-none transition-all"
                    />
                    <button 
                        onClick={handleGenerateVariation}
                        disabled={isCoolingDown}
                        className={`
                            p-1.5 rounded-sm transition-colors border border-white/20
                            ${isCoolingDown 
                                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            }
                        `}
                        title="Generate Variation"
                    >
                        <Icons.Sparkles /> 
                    </button>
                </div>

                {/* Keyword Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {img.tags?.slice(0, 3).map((tag, i) => (
                        <span 
                            key={i} 
                            className="text-[9px] px-2 py-1 rounded-sm border border-emerald-500/30 bg-emerald-950/30 text-emerald-100/80 uppercase tracking-wide truncate max-w-[100px]"
                        >
                            {tag}
                        </span>
                    ))}
                    {(img.tags?.length || 0) > 3 && (
                        <span className="text-[9px] px-2 py-1 rounded-sm border border-white/10 text-white/50">...</span>
                    )}
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-3">
                    <span className="text-[10px] text-neutral-500 font-mono">
                        ID: {img.id.slice(-4)}
                    </span>
                    <div className="flex gap-2">
                         {/* Export Spec Sheet Button */}
                         <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onExport(img);
                            }}
                            className="p-2 rounded-full transition-colors backdrop-blur-sm bg-white/10 text-white hover:bg-emerald-600"
                            title="Export Tech Pack (.xlsx)"
                         >
                            <Icons.Document />
                         </button>

                        {/* Quick Generate Button (Re-run exact config) */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (img.config) onGenerate(img.config);
                            }}
                            disabled={isCoolingDown}
                            className={`
                                p-2 rounded-full transition-colors backdrop-blur-sm
                                bg-white/10 hover:bg-emerald-600 text-white
                                ${isCoolingDown ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            title="Re-generate Exact Config"
                        >
                            <Icons.Refresh />
                        </button>

                        <button 
                            onClick={(e) => onToggleSave(img.id, e)}
                            className={`
                                p-2 rounded-full transition-colors backdrop-blur-sm
                                ${img.saved ? 'bg-pink-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}
                            `}
                            title={img.saved ? "Unsave" : "Save Design"}
                        >
                            {img.saved ? <Icons.HeartSolid /> : <Icons.Heart />}
                        </button>
                        
                        {/* Quick Save / Download Button */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onQuickSave(img);
                            }}
                            className="p-2 rounded-full transition-colors backdrop-blur-sm bg-white/10 text-white hover:bg-emerald-600"
                            title="Download Image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ImageCard;