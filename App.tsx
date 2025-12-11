import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ReferenceSlots from './components/ReferenceSlots';
import ImageCard from './components/ImageCard';
import { DEFAULT_CONFIG, Icons } from './constants';
import { JewelryConfig, ReferenceSlot, GeneratedImage } from './types';
import { utils, writeFile } from 'xlsx';
import { useJewelryAnalysis } from './hooks/useJewelryAnalysis';
import { useJewelryGenerator } from './hooks/useJewelryGenerator';

const App: React.FC = () => {
  // Config State
  const [config, setConfig] = useState<JewelryConfig>(DEFAULT_CONFIG);
  const [slot, setSlot] = useState<ReferenceSlot>({ id: 1, image: null });
  
  // Custom Hooks for Logic
  const analysisEngine = useJewelryAnalysis();
  const generatorEngine = useJewelryGenerator();

  // Filter State
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  // File System State
  // @ts-ignore
  const [directoryHandle, setDirectoryHandle] = useState<any>(null);

  // Handlers
  const handleConfigChange = (key: keyof JewelryConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setSlot({ id: 1, image: base64 });
      analysisEngine.analyze(base64);
    };
    reader.readAsDataURL(file);
  };

  // Helper to extract tags from current config
  const getActiveTags = (cfg: JewelryConfig): string[] => {
    const fields = [cfg.material, cfg.craftsmanship, cfg.chainType, cfg.extraElements, cfg.audience, cfg.miscPrompts];
    const tags: string[] = [];
    fields.forEach(f => {
        if (f) {
            f.split(',').forEach(t => {
                const clean = t.trim();
                const displayTag = clean.replace(/^(Color Tone:|Style:)\s*/i, '');
                if(displayTag) tags.push(displayTag);
            });
        }
    });
    return Array.from(new Set(tags)); 
  };

  // Derive filtered images
  const filteredImages = useMemo(() => {
    const images = generatorEngine.generatedImages;
    if (activeFilter === 'SAVED') return images.filter(img => img.saved);
    if (!activeFilter) return images;
    return images.filter(img => img.tags?.includes(activeFilter));
  }, [generatorEngine.generatedImages, activeFilter]);

  // Toggle Save Status
  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    generatorEngine.toggleSave(id);
  };

  // Directory Selection
  const handleSetDirectory = async () => {
      try {
          // @ts-ignore
          if (window.showDirectoryPicker) {
              // @ts-ignore
              const handle = await window.showDirectoryPicker();
              setDirectoryHandle(handle);
          } else {
              alert("Your browser does not support the File System Access API. Please use Chrome, Edge, or Opera.");
          }
      } catch (err) {
          console.error("Directory selection cancelled or failed:", err);
      }
  };

  // Base64 to Blob helper
  const base64ToBlob = (base64: string, mimeType: string = 'image/png') => {
      const byteCharacters = atob(base64.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
  };

  // Quick Save / Download
  const handleQuickSave = async (img: GeneratedImage) => {
      const filename = img.tags && img.tags.length > 0 
          ? img.tags.join('_').replace(/[^a-zA-Z0-9_]/g, '') + `_${img.id.slice(-4)}.png`
          : `yunkey_design_${img.id}.png`;

      // Method A: Direct File System Write
      if (directoryHandle) {
          try {
              // @ts-ignore
              const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
              // @ts-ignore
              const writable = await fileHandle.createWritable();
              const blob = base64ToBlob(img.url);
              await writable.write(blob);
              await writable.close();
              console.log(`Saved ${filename} to directory.`);
              return; 
          } catch (err) {
              console.error("Failed to write to file system:", err);
          }
      }

      // Method B: Standard Browser Download (Fallback)
      const link = document.createElement('a');
      link.href = img.url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleExportSpec = (img: GeneratedImage) => {
    if (!img.config) return;

    const data = [
        ["Jewelry Design Tech Pack", ""],
        ["Generated ID", img.id],
        ["Date", new Date(img.timestamp).toLocaleString()],
        ["", ""],
        ["SPECIFICATIONS", ""],
        ["Material", img.config.material],
        ["Craftsmanship", img.config.craftsmanship],
        ["Chain/Structure", img.config.chainType],
        ["Extra Elements", img.config.extraElements],
        ["Target Audience", img.config.audience],
        ["", ""],
        ["SETTINGS", ""],
        ["Resolution", img.config.resolution],
        ["Aspect Ratio", img.config.aspectRatio],
        ["Creativity", `${img.config.creativityStrength}%`],
        ["", ""],
        ["PROMPT DATA", ""],
        ["Instructions", img.config.miscPrompts],
        ["Tags", img.tags?.join(', ') || ""]
    ];

    const ws = utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 20 }, { wch: 50 }];
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Tech Pack");
    writeFile(wb, `YunKey_TechPack_${img.id.slice(-6)}.xlsx`);
  };

  const handleGenerate = async (configOverride?: Partial<JewelryConfig>) => {
    const currentConfig = configOverride ? { ...config, ...configOverride } : config;
    if (configOverride) setConfig(currentConfig);

    const activeTags = getActiveTags(currentConfig);
    const selectedImage = slot.image;

    await generatorEngine.generate(currentConfig, selectedImage, activeTags);
    
    if (activeFilter === 'SAVED') setActiveFilter(null);
  };

  // Lightbox Handlers
  const openLightbox = (img: GeneratedImage) => {
    if (img.status === 'loading') return;
    setLightboxImage(img);
    setZoomScale(1);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setZoomScale(1);
  };

  const handleWheelZoom = (e: React.WheelEvent) => {
    const delta = -e.deltaY * 0.001;
    setZoomScale(prev => Math.min(Math.max(0.5, prev + delta), 5));
  };

  return (
    <div className="flex min-h-screen bg-neutral-950 text-slate-100 font-sans overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCIgb3BhY2l0eT0iMC4wMiI+PHRleHQgeD0iNTAiIHk9IjE1MCIgZm9udC1mYW1pbHk9InNlcmlmIiBmb250LXNpemU9IjQwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHJvdGF0ZT0iLTQ1IiB0cmFuc2Zvcm0tb3JpZ2luPSI1MCAxNTAiPll1bktleTwvdGV4dD48L3N2Zz4=')]">
      
      {/* Lightbox Overlay */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center overflow-hidden backdrop-blur-md"
          onClick={closeLightbox}
        >
           {/* Controls */}
           <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
              <div className="bg-black/50 backdrop-blur px-4 py-2 rounded text-sm text-slate-300 pointer-events-auto border border-white/10">
                 Mouse Wheel to Zoom ({Math.round(zoomScale * 100)}%)
              </div>
              <button 
                onClick={closeLightbox}
                className="group bg-neutral-900/80 hover:bg-white/10 rounded-full p-3 transition-colors pointer-events-auto border border-white/10"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
              </button>
           </div>
           <div 
             className="relative w-full h-full flex items-center justify-center p-10 cursor-move"
             onWheel={handleWheelZoom}
           >
              <img 
                src={lightboxImage.url} 
                alt="Full Detail"
                style={{ 
                  transform: `scale(${zoomScale})`, 
                  transition: 'transform 0.1s ease-out' 
                }}
                className="max-w-full max-h-full object-contain select-none drop-shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
           </div>
        </div>
      )}

      {/* Left Main Content */}
      <div className="flex-1 flex flex-col h-screen relative">
        <header className="h-20 border-b border-white/5 bg-neutral-950/50 backdrop-blur-md flex items-center justify-between px-10 z-10 shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-emerald-400/30 rounded flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                    <Icons.Diamond />
                </div>
                <div>
                    <h1 className="font-serif text-2xl tracking-[0.2em] text-white">YunKey</h1>
                    <p className="text-[10px] text-emerald-400/80 font-medium uppercase tracking-[0.3em] mt-1">Jewelry Development OS</p>
                </div>
            </div>
            <div className="text-xs text-neutral-500 flex items-center gap-3 font-mono border border-white/5 px-3 py-1 rounded-full bg-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                v1.2.0 (Gemini 3 Pro)
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 scroll-smooth pb-32">
            
            {/* 1. Reference Slots & Analysis */}
            <ReferenceSlots 
                slot={slot}
                analysis={analysisEngine.analysis}
                isAnalyzing={analysisEngine.isAnalyzing}
                onUpload={handleImageUpload}
            />

            {/* 2. Results Section */}
            <div className="mt-12">
                <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-4">
                    <h2 className="text-xl font-serif text-white tracking-widest flex items-center gap-3">
                        <span className="text-emerald-500/50">02</span> 爆款升级 (BEST SELLER UPGRADE)
                    </h2>
                    <span className="text-neutral-500 text-xs font-mono tracking-wider">
                      {activeFilter ? `FILTERED: ${filteredImages.length}` : `TOTAL: ${generatorEngine.generatedImages.filter(i => i.status !== 'loading').length}`}
                    </span>
                </div>
                
                {generatorEngine.generatedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8 p-1 animate-in fade-in slide-in-from-left-4">
                     <button
                       onClick={() => setActiveFilter(null)}
                       className={`
                         text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-sm border transition-all
                         ${!activeFilter 
                           ? 'bg-emerald-500/90 text-black border-emerald-500 font-bold' 
                           : 'bg-transparent text-neutral-500 border-white/10 hover:border-emerald-500/30 hover:text-emerald-400'
                         }
                       `}
                     >
                       All
                     </button>
                     <button
                       onClick={() => setActiveFilter(activeFilter === 'SAVED' ? null : 'SAVED')}
                       className={`
                         text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-sm border transition-all flex items-center gap-2
                         ${activeFilter === 'SAVED'
                           ? 'bg-pink-500/90 text-white border-pink-500 font-bold' 
                           : 'bg-transparent text-neutral-500 border-white/10 hover:border-pink-500/30 hover:text-pink-400'
                         }
                       `}
                     >
                       <Icons.HeartSolid /> Saved
                     </button>
                  </div>
                )}
                
                {generatorEngine.error && (
                    <div className="mb-8 text-rose-300 text-center p-6 bg-rose-950/30 rounded-lg border border-rose-900/50 backdrop-blur-sm">
                        <p className="font-light tracking-wide flex items-center justify-center gap-3">
                            <span className="text-xl">⚠️</span> {generatorEngine.error}
                        </p>
                    </div>
                )}
                
                {generatorEngine.generatedImages.length === 0 ? (
                   <div className="w-full border border-dashed border-white/10 rounded-sm min-h-[300px] flex flex-col items-center justify-center bg-white/[0.02]">
                        <div className="text-neutral-600 text-sm tracking-widest uppercase font-light">
                            No designs generated yet.
                        </div>
                   </div>
                ) : filteredImages.length === 0 ? (
                    <div className="w-full border border-dashed border-white/10 rounded-sm min-h-[200px] flex flex-col items-center justify-center bg-white/[0.02]">
                        <div className="text-neutral-600 text-sm tracking-widest uppercase">
                            No matches found.
                        </div>
                        <button 
                            onClick={() => setActiveFilter(null)}
                            className="mt-4 text-emerald-400 text-xs hover:underline uppercase tracking-wide"
                        >
                            Clear Filter
                        </button>
                   </div>
                ) : (
                    <div className="grid grid-cols-3 gap-8 animate-in fade-in duration-500">
                        {filteredImages.map((img) => (
                           <ImageCard 
                              key={img.id}
                              img={img}
                              isCoolingDown={generatorEngine.isCoolingDown}
                              onOpenLightbox={openLightbox}
                              onToggleSave={handleToggleSave}
                              onQuickSave={handleQuickSave}
                              onGenerate={handleGenerate}
                              onExport={handleExportSpec}
                           />
                        ))}
                    </div>
                )}
            </div>

        </div>
      </div>

      <Sidebar 
        config={config} 
        onChange={handleConfigChange}
        onQuickGenerate={handleGenerate}
        onMainGenerate={handleGenerate}
        isCoolingDown={generatorEngine.isCoolingDown}
        analysis={analysisEngine.analysis}
        directoryHandle={directoryHandle}
        onSetDirectory={handleSetDirectory}
      />
      
    </div>
  );
};

export default App;