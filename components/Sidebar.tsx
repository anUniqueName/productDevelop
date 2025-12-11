
import React, { useState, useRef } from 'react';
import { JewelryConfig, AspectRatio, ImageResolution, CreativeConcept, ImageAnalysis, KeywordAnalysis } from '../types';
import { Icons } from '../constants';
import { useMarketData } from '../hooks/useMarketData';
import { useInspiration } from '../hooks/useInspiration';
import PromptEditor from './PromptEditor';

interface InputGroupProps {
  label: string;
  subLabel?: string;
  children: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, subLabel, children }) => (
  <div className="mb-6 group">
    <label className="block text-slate-300 text-xs font-medium mb-2 flex items-center gap-2 uppercase tracking-wide group-hover:text-emerald-400 transition-colors">
      {label}
      {subLabel && <span className="text-[10px] text-slate-600 font-normal normal-case tracking-normal">({subLabel})</span>}
    </label>
    {children}
  </div>
);

interface SidebarProps {
  config: JewelryConfig;
  onChange: (key: keyof JewelryConfig, value: any) => void;
  onQuickGenerate?: (configOverride: Partial<JewelryConfig>) => void;
  onMainGenerate?: () => void;
  isCoolingDown?: boolean;
  analysis?: ImageAnalysis | null;
  directoryHandle?: any; 
  onSetDirectory?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  config, 
  onChange, 
  onQuickGenerate, 
  onMainGenerate, 
  isCoolingDown, 
  analysis,
  directoryHandle,
  onSetDirectory
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);
  const [newKeywordInput, setNewKeywordInput] = useState("");

  // Use Custom Hooks
  const marketData = useMarketData();
  const inspiration = useInspiration();

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) marketData.processFile(file);
    if (event.target) event.target.value = '';
  };

  const handleAddKeyword = (categoryKey: string) => {
    marketData.addCustomKeyword(categoryKey, newKeywordInput);
    setNewKeywordInput("");
    setAddingToCategory(null);
  };

  // Helper to toggle value in comma separated string
  const toggleValue = (currentString: string, value: string): string => {
      const parts = currentString.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (parts.includes(value)) {
          return parts.filter(s => s !== value).join(', ');
      } else {
          return [...parts, value].join(', ');
      }
  };

  const handleKeywordToggle = (categoryKey: string, keyword: string) => {
      const valueToUse = keyword.includes(' (') ? keyword.split(' (')[0] : keyword;
      let targetField: keyof JewelryConfig = 'miscPrompts';
      let valuePrefix = '';

      switch (categoryKey) {
          case 'color': targetField = 'miscPrompts'; valuePrefix = 'Color Tone: '; break;
          case 'material': targetField = 'material'; break;
          case 'stone': targetField = 'material'; break;
          case 'craftsmanship': targetField = 'craftsmanship'; break;
          case 'style': targetField = 'miscPrompts'; valuePrefix = 'Style: '; break;
          case 'element': targetField = 'extraElements'; break;
      }

      const finalVal = valuePrefix ? `${valuePrefix}${valueToUse}` : valueToUse;
      onChange(targetField, toggleValue(config[targetField] as string, finalVal));
  };

  const isKeywordActive = (categoryKey: string, keyword: string) => {
      const valueToUse = keyword.includes(' (') ? keyword.split(' (')[0] : keyword;
      let targetField: keyof JewelryConfig = 'miscPrompts';
      let checkValue = valueToUse;

      switch (categoryKey) {
          case 'color': targetField = 'miscPrompts'; checkValue = `Color Tone: ${valueToUse}`; break;
          case 'material': targetField = 'material'; break;
          case 'stone': targetField = 'material'; break;
          case 'craftsmanship': targetField = 'craftsmanship'; break;
          case 'style': targetField = 'miscPrompts'; checkValue = `Style: ${valueToUse}`; break;
          case 'element': targetField = 'extraElements'; break;
      }
      return (config[targetField] as string).includes(checkValue);
  };

  const handleApplyConcept = (concept: CreativeConcept) => {
      if (onQuickGenerate) onQuickGenerate(concept.config);
  };

  return (
    <div className="w-[420px] bg-neutral-950/90 border-l border-white/5 flex flex-col h-screen overflow-hidden shadow-2xl z-20 backdrop-blur-md">
      
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-neutral-950/80 z-10 shrink-0">
        <h2 className="text-lg font-serif text-white flex items-center gap-3 tracking-widest">
          <span className="text-emerald-500"><Icons.Settings /></span>
          无限开发配置器
        </h2>
        <p className="text-neutral-500 text-[10px] mt-1 uppercase tracking-[0.2em]">Design Configurator</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth custom-scrollbar">

        {/* Section 0: Prompt Configuration */}
        <section>
          <PromptEditor />
        </section>

        {/* Section 1: Data Source */}
        <section>
          <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.15em]">
             <Icons.Database /> 词库数据智能选款 (Data Selection)
          </h3>
          
          {!marketData.isAnalyzed ? (
             <div 
                onClick={handleUploadClick}
                className={`
                    border border-dashed border-white/10 rounded-sm p-6 flex flex-col items-center justify-center text-center 
                    bg-white/[0.02] mb-4 transition-all cursor-pointer group hover:border-emerald-500/50 hover:bg-emerald-500/5
                    ${marketData.isAnalyzing ? 'animate-pulse border-emerald-500/50' : ''}
                `}
             >
                {marketData.isAnalyzing ? (
                    <div className="text-emerald-500 flex flex-col items-center">
                        <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mb-2"></div>
                        <span className="text-xs uppercase tracking-wide">Analyzing Data...</span>
                    </div>
                ) : (
                    <>
                        <div className="text-neutral-500 mb-2 group-hover:text-emerald-400 transition-colors"><Icons.Upload /></div>
                        <p className="text-white text-xs font-medium uppercase tracking-wide">点击上传爆款数据表 (Upload Data)</p>
                        <p className="text-neutral-600 text-[10px] mt-1 font-mono">.xlsx, .csv supported</p>
                    </>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".xlsx, .xls, .csv" 
                    onChange={handleFileChange}
                />
             </div>
          ) : (
            <div className="mb-4 bg-emerald-950/20 rounded-sm p-4 border border-emerald-500/20">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 uppercase tracking-wide font-bold">
                        <Icons.Check /> 已分析完成 (Analyzed)
                    </span>
                    <button onClick={marketData.resetAnalysis} className="text-[10px] text-neutral-500 hover:text-white underline">
                        重新上传 (Re-upload)
                    </button>
                </div>
                <div className="h-0.5 w-full bg-emerald-900/50 overflow-hidden"><div className="h-full bg-emerald-500 w-full"></div></div>
            </div>
          )}
          
          {/* Static Filter Inputs */}
          <div className="bg-white/[0.03] rounded-sm p-4 border border-white/5">
             <div className="text-[10px] text-neutral-400 mb-3 flex items-center gap-1 uppercase tracking-wider font-bold">
                <Icons.Filter /> 核心筛选维度 (Core Dimensions)
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[9px] text-emerald-600 block mb-1 uppercase tracking-wide">ABA排名</label>
                    <input 
                        type="number" value={config.minRanking}
                        onChange={(e) => onChange('minRanking', parseInt(e.target.value))}
                        className="w-full bg-neutral-900 border border-white/10 rounded-sm px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                    />
                </div>
                <div>
                    <label className="text-[9px] text-emerald-600 block mb-1 uppercase tracking-wide">搜索量</label>
                    <input 
                        type="number" value={config.minSearchVolume}
                        onChange={(e) => onChange('minSearchVolume', parseInt(e.target.value))}
                        className="w-full bg-neutral-900 border border-white/10 rounded-sm px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                    />
                </div>
             </div>
          </div>
        </section>

        {/* Section 1.5: Dynamic Keyword Analysis Results */}
        {marketData.isAnalyzed && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                <h3 className="text-emerald-200 font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.15em]">
                    <span className="text-emerald-500">✦</span> 智能词根分析 (Smart Root Analysis)
                </h3>
                <div className="space-y-4">
                    {Object.values(marketData.data).map((category: any) => {
                        const foundItems = category.items.filter((item: any) => item.count > 0);
                        const supplementalItems = category.items.filter((item: any) => item.count === 0);
                        return (
                            <div key={category.key} className="bg-white/[0.02] rounded-sm p-3 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-1">
                                    <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">{category.label}</div>
                                    <button 
                                        onClick={() => setAddingToCategory(addingToCategory === category.key ? null : category.key)}
                                        className="text-emerald-500 hover:text-emerald-400 text-[10px] px-1"
                                    >+ Add</button>
                                </div>
                                {addingToCategory === category.key && (
                                    <div className="mb-2 flex gap-2">
                                        <input 
                                            type="text" value={newKeywordInput}
                                            onChange={(e) => setNewKeywordInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword(category.key)}
                                            placeholder="Add keyword..."
                                            className="w-full bg-black/50 border border-emerald-500/50 rounded-sm px-2 py-1 text-[10px] text-white focus:outline-none"
                                            autoFocus
                                        />
                                        <button onClick={() => handleAddKeyword(category.key)} className="bg-emerald-600 text-white text-[10px] px-2 rounded-sm">OK</button>
                                    </div>
                                )}
                                {foundItems.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-[8px] text-emerald-500 uppercase mb-1 tracking-wider opacity-80">核心词根 (Found)</div>
                                        <div className="flex flex-wrap gap-2">
                                            {foundItems.map((item: any) => {
                                                const active = isKeywordActive(category.key, item.name);
                                                return (
                                                    <button key={item.name} onClick={() => handleKeywordToggle(category.key, item.name)} className={`text-[10px] px-2 py-1 rounded-sm border transition-all flex items-center gap-1 uppercase tracking-wide ${active ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-emerald-900/10 border-emerald-500/20 text-emerald-100/70'}`}>
                                                        {item.name} <span className={`text-[8px] font-mono ${active ? 'text-emerald-500' : 'text-emerald-600'}`}>{item.count}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {supplementalItems.length > 0 && (
                                    <div>
                                        <div className="text-[8px] text-slate-500 uppercase mb-1 tracking-wider opacity-80">补充词根 (Suggestions)</div>
                                        <div className="flex flex-wrap gap-2">
                                            {supplementalItems.map((item: any) => {
                                                const active = isKeywordActive(category.key, item.name);
                                                return (
                                                    <button key={item.name} onClick={() => handleKeywordToggle(category.key, item.name)} className={`text-[10px] px-2 py-1 rounded-sm border transition-all flex items-center gap-1 uppercase tracking-wide ${active ? 'bg-slate-700/50 border-slate-500 text-slate-200' : 'bg-transparent border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'}`}>
                                                        {item.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        )}

        {/* Section 2: Deep Details */}
        <section>
          <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.15em]">
             <Icons.Sparkles /> 深度细节 (Deep Details)
          </h3>
          <InputGroup label="核心材质" subLabel="Material"><input type="text" value={config.material} onChange={(e) => onChange('material', e.target.value)} className="w-full bg-neutral-900 border border-white/10 rounded-sm p-2.5 text-xs text-white focus:border-cyan-500 outline-none placeholder-neutral-700" placeholder="18K Gold, Silver..." /></InputGroup>
          <InputGroup label="工艺细节" subLabel="Technique"><input type="text" value={config.craftsmanship} onChange={(e) => onChange('craftsmanship', e.target.value)} className="w-full bg-neutral-900 border border-white/10 rounded-sm p-2.5 text-xs text-white focus:border-cyan-500 outline-none placeholder-neutral-700" placeholder="Micro-setting..." /></InputGroup>
          <InputGroup label="链条/结构" subLabel="Structure"><input type="text" value={config.chainType} onChange={(e) => onChange('chainType', e.target.value)} className="w-full bg-neutral-900 border border-white/10 rounded-sm p-2.5 text-xs text-white focus:border-cyan-500 outline-none placeholder-neutral-700" placeholder="Cuban, Snake..." /></InputGroup>
          <InputGroup label="额外元素" subLabel="Motifs"><input type="text" value={config.extraElements} onChange={(e) => onChange('extraElements', e.target.value)} className="w-full bg-neutral-900 border border-white/10 rounded-sm p-2.5 text-xs text-white focus:border-cyan-500 outline-none placeholder-neutral-700" placeholder="Bowknot, Heart..." /></InputGroup>
          <InputGroup label="目标人群" subLabel="Target"><input type="text" value={config.audience} onChange={(e) => onChange('audience', e.target.value)} className="w-full bg-neutral-900 border border-white/10 rounded-sm p-2.5 text-xs text-white focus:border-cyan-500 outline-none placeholder-neutral-700" placeholder="Gen Z, Wedding..." /></InputGroup>
        </section>

        {/* Section 3: Creative Control */}
        <section>
            <h3 className="text-purple-400 font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.15em]"><Icons.Settings /> 创意控制</h3>
            <InputGroup label="其他指令" subLabel="Styles, Colors"><textarea value={config.miscPrompts} onChange={(e) => onChange('miscPrompts', e.target.value)} className="w-full bg-neutral-900 border border-white/10 rounded-sm p-2.5 text-xs text-white focus:border-purple-500 outline-none h-20 resize-none placeholder-neutral-700" placeholder="Extra instructions..." /></InputGroup>
            <div className="mb-6">
                <div className="flex justify-between text-[10px] text-slate-400 mb-2 uppercase tracking-wide"><span>创意强度</span><span className="font-bold text-white">{config.creativityStrength}%</span></div>
                <input type="range" min="0" max="100" value={config.creativityStrength} onChange={(e) => onChange('creativityStrength', parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500" />
            </div>
        </section>

         {/* Section 4: Settings */}
         <section>
            <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.15em]"><Icons.Settings /> 设置</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-[9px] text-slate-500 block mb-2 uppercase tracking-wide">比例</label>
                    <select value={config.aspectRatio} onChange={(e) => onChange('aspectRatio', e.target.value as AspectRatio)} className="w-full bg-neutral-900 border border-white/10 rounded-sm p-2 text-xs text-white focus:border-white/30 outline-none">
                        <option value="1:1">1:1 (Square)</option><option value="3:4">3:4 (Portrait)</option><option value="4:3">4:3 (Landscape)</option><option value="9:16">9:16 (Story)</option><option value="16:9">16:9 (Cinema)</option>
                    </select>
                </div>
                <div>
                    <label className="text-[9px] text-slate-500 block mb-2 uppercase tracking-wide">分辨率</label>
                    <select value={config.resolution} onChange={(e) => onChange('resolution', e.target.value as ImageResolution)} className="w-full bg-neutral-900 border border-white/10 rounded-sm p-2 text-xs text-white focus:border-white/30 outline-none">
                        <option value="1K">1K</option><option value="2K">2K (High)</option><option value="4K">4K (Ultra)</option>
                    </select>
                </div>
            </div>
             <div className="mb-4">
                 <label className="text-[9px] text-slate-500 block mb-2 uppercase tracking-wide">自动保存位置</label>
                 <button onClick={onSetDirectory} className={`w-full flex items-center justify-between px-3 py-2 rounded-sm border transition-all text-xs ${directoryHandle ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-neutral-900 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'}`}>
                     <span className="flex items-center gap-2"><Icons.Document /> {directoryHandle ? 'Folder Selected' : 'Set Folder'}</span>{directoryHandle && <Icons.Check />}
                 </button>
             </div>
         </section>

         {/* Section 5: AI Inspiration Engine */}
         <section className="mt-8 pt-6 border-t border-white/5 pb-24">
             <div className="flex items-center gap-2 mb-4">
                 <div className="p-1 bg-pink-500/10 rounded text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]"><Icons.Sparkles /></div>
                 <h3 className="text-pink-400 font-bold uppercase tracking-[0.15em] text-xs">AI 灵感引擎</h3>
             </div>
             <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5 backdrop-blur-sm">
                 <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">基于 {analysis ? <span className="text-emerald-400">分析</span> : "输入"} 进行创意发散。</p>
                 <div className="relative mb-3">
                     <textarea value={inspiration.ideaInput} onChange={(e) => inspiration.setIdeaInput(e.target.value)} className="w-full bg-neutral-900/50 border border-white/10 rounded-md p-3 text-xs text-white focus:border-pink-500/50 outline-none resize-none h-16 shadow-inner" placeholder={analysis ? "覆盖分析..." : "例如：夏季订婚戒指..."} />
                     <button onClick={() => inspiration.generateConcepts(analysis || null)} disabled={inspiration.isIdeaGenerating} className={`absolute bottom-2 right-2 px-3 py-1 rounded-sm text-[10px] font-bold transition-all flex items-center gap-1 uppercase tracking-wide ${inspiration.isIdeaGenerating ? 'bg-neutral-800 text-neutral-500 cursor-wait' : 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-900/50'}`}>
                         {inspiration.isIdeaGenerating ? 'Thinking...' : 'Generate Ideas ✨'}
                     </button>
                 </div>
                 {inspiration.generatedConcepts.length > 0 && (
                     <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                         <div className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest mb-1 border-b border-white/5 pb-1">{inspiration.generatedConcepts.length} Variations</div>
                         {inspiration.generatedConcepts.map((concept, idx) => (
                             <div key={idx} onClick={() => handleApplyConcept(concept)} className="group relative bg-neutral-900 border border-white/5 hover:border-pink-500/30 rounded-sm p-3 cursor-pointer transition-all hover:bg-neutral-800">
                                 <div className="flex justify-between items-start mb-1"><h4 className="text-pink-300 font-bold text-[11px] flex items-center gap-1">{concept.title}</h4><span className="text-[9px] opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity uppercase tracking-wide">Generate →</span></div>
                                 <p className="text-[10px] text-slate-500 mb-2 leading-tight font-light">{concept.reasoning}</p>
                                 <div className="flex flex-wrap gap-1">
                                     {concept.config.material?.split(',')[0] && <span className="text-[9px] border border-white/10 px-1 rounded-sm text-neutral-400">{concept.config.material.split(',')[0]}</span>}
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
         </section>
      </div>
      
      {/* Footer Fixed Button */}
      <div className="p-6 border-t border-white/5 bg-neutral-950/95 backdrop-blur-md z-30 absolute bottom-0 w-full">
         <button onClick={() => onMainGenerate?.()} disabled={isCoolingDown} className={`w-full py-4 rounded-full font-bold text-sm tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-3 border border-emerald-500/20 uppercase ${isCoolingDown ? 'bg-neutral-900 text-neutral-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white hover:scale-[1.02] shadow-emerald-900/50'}`}>
            {isCoolingDown ? <span className="animate-pulse">Cooldown...</span> : <><Icons.Sparkles /> 一键爆款即来</>}
         </button>
      </div>
    </div>
  );
};

export default Sidebar;
