import React, { useRef, useState } from 'react';
import { ReferenceSlot, ImageAnalysis } from '../types';
import { Icons } from '../constants';

interface ReferenceSlotsProps {
  slot: ReferenceSlot; // Only one slot now
  analysis: ImageAnalysis | null;
  isAnalyzing: boolean;
  onUpload: (file: File) => void;
}

const ReferenceSlots: React.FC<ReferenceSlotsProps> = ({
  slot,
  analysis,
  isAnalyzing,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="w-full mb-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-serif text-white tracking-wide flex items-center gap-2">
          1. 视觉分析与开发 (VISUAL ANALYSIS)
        </h2>
        <span className="text-slate-400 text-sm">
          上传图片，AI自动提取设计核心
        </span>
      </div>

      {/* Zoom Modal */}
      {isZoomed && slot.image && (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center cursor-zoom-out p-10"
            onClick={() => setIsZoomed(false)}
        >
            <div className="relative max-w-full max-h-full">
                <img 
                    src={slot.image} 
                    alt="Reference Full" 
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image itself
                />
                <button 
                    onClick={() => setIsZoomed(false)}
                    className="absolute -top-12 right-0 text-white/70 hover:text-white flex items-center gap-2"
                >
                    <span className="text-sm">Close</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
      )}

      {/* Main Grid - Removed fixed height, using aspect-square for image */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Left Column: Image Upload Slot (Strict 1:1 Aspect Ratio) */}
        <div 
          className={`
            col-span-1 aspect-square relative rounded-xl border-2 transition-all duration-300 group
            flex flex-col items-center justify-center overflow-hidden bg-slate-800/50
            ${slot.image ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-slate-700 hover:border-slate-500 cursor-pointer'}
          `}
          onClick={!slot.image ? handleUploadClick : undefined}
        >
          {slot.image ? (
            <>
              {/* Image is clickable to zoom */}
              <div 
                className="w-full h-full cursor-zoom-in"
                onClick={() => setIsZoomed(true)}
              >
                  <img 
                    src={slot.image} 
                    alt="Reference" 
                    className="w-full h-full object-cover"
                  />
              </div>

               {/* Re-upload Button (Top Right Corner) */}
               <button
                  onClick={handleUploadClick}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-amber-600 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                  title="更换图片 (Replace)"
               >
                  <Icons.Upload />
               </button>
            </>
          ) : (
            <div className="flex flex-col items-center text-slate-500 p-4 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-700/50 flex items-center justify-center mb-4 
                group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
                <div className="transform group-hover:scale-110 transition-transform">
                   <Icons.Upload /> 
                </div>
              </div>
              <span className="text-sm font-medium">点击上传参考图</span>
              <span className="text-xs mt-2 opacity-50">1:1 Square</span>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {/* Right Column: AI Analysis Panel (Takes up 2 slots) - Matches height of 1:1 image via grid */}
        <div className="col-span-2 bg-slate-900/80 border border-slate-700 rounded-xl p-6 relative overflow-hidden flex flex-col h-full">
          
          <div className="absolute top-0 right-0 p-4 opacity-10">
              <Icons.Database />
          </div>

          <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2 shrink-0">
             {isAnalyzing ? (
                 <>
                   <span className="animate-spin h-3 w-3 border-2 border-amber-500 border-t-transparent rounded-full"></span>
                   正在分析设计核心... (ANALYZING)
                 </>
             ) : (
                 <>
                   <Icons.Sparkles /> 结构化设计解析 (DESIGN BREAKDOWN)
                 </>
             )}
          </h3>

          {!slot.image ? (
             // Empty State
             <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-lg">
                <p>等待图片上传...</p>
                <p className="text-xs mt-1">Waiting for image upload</p>
             </div>
          ) : isAnalyzing ? (
             // Loading State
             <div className="flex-1 space-y-4 animate-pulse overflow-hidden">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-20 bg-slate-800 rounded w-full"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-slate-800 rounded"></div>
                    <div className="h-12 bg-slate-800 rounded"></div>
                </div>
                <div className="h-12 bg-slate-800 rounded w-full"></div>
             </div>
          ) : analysis ? (
             // Result State
             <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4 overflow-y-auto pr-2 custom-scrollbar content-start">
                
                <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">设计思路 (Design Concept)</label>
                    <p className="text-slate-200 text-sm leading-relaxed border-l-2 border-amber-500 pl-3 mt-1">
                        {analysis.designConcept}
                    </p>
                </div>

                <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">设计风格 (Style)</label>
                    <div className="bg-slate-800/50 rounded p-2 mt-1 text-xs text-amber-200 border border-slate-700/50">
                        {analysis.style}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">目标人群 (Audience)</label>
                    <div className="bg-slate-800/50 rounded p-2 mt-1 text-xs text-cyan-200 border border-slate-700/50">
                        {analysis.audience}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">客户情绪点 (Emotional Hook)</label>
                    <div className="bg-slate-800/50 rounded p-2 mt-1 text-xs text-pink-200 border border-slate-700/50">
                        {analysis.emotionalPoint}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">使用场景 (Scenario)</label>
                    <div className="bg-slate-800/50 rounded p-2 mt-1 text-xs text-purple-200 border border-slate-700/50">
                        {analysis.scenario}
                    </div>
                </div>

                <div className="col-span-2 mt-2">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                        <span className="text-red-500">★</span> 开发核心 (Core Point)
                    </label>
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-amber-500/30 rounded-lg p-3 mt-1">
                        <p className="text-amber-400 font-medium text-sm">
                            {analysis.corePoint}
                        </p>
                    </div>
                </div>

             </div>
          ) : null}

        </div>
      </div>
    </div>
  );
};

export default ReferenceSlots;