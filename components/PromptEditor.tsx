import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { PromptConfig, jewelryPromptConfig, genericPromptConfig, fashionPromptConfig } from '../config/prompts.config';
import { promptConfigManager } from '../utils/promptConfigManager';

interface PromptEditorProps {
  // 可选的回调，用于通知父组件配置已更改
  onConfigChange?: (config: PromptConfig) => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ onConfigChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePreset, setActivePreset] = useState<'jewelry' | 'generic' | 'fashion' | 'custom'>('jewelry');
  const [config, setConfig] = useState<PromptConfig>(jewelryPromptConfig);

  // 从配置管理器加载当前配置
  useEffect(() => {
    const currentConfig = promptConfigManager.getConfig();
    setConfig(currentConfig);

    // 检查是否是自定义配置
    const saved = localStorage.getItem('customPromptConfig');
    if (saved) {
      setActivePreset('custom');
    }
  }, []);

  // 切换预设
  const handlePresetChange = (preset: 'jewelry' | 'generic' | 'fashion') => {
    let newConfig: PromptConfig;
    switch (preset) {
      case 'generic':
        newConfig = genericPromptConfig;
        break;
      case 'fashion':
        newConfig = fashionPromptConfig;
        break;
      case 'jewelry':
      default:
        newConfig = jewelryPromptConfig;
    }
    setConfig(newConfig);
    setActivePreset(preset);
    promptConfigManager.setConfig(newConfig);
    if (onConfigChange) onConfigChange(newConfig);
  };

  // 更新配置字段
  const updateField = (path: string[], value: string) => {
    const newConfig = { ...config };
    let current: any = newConfig;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;

    setConfig(newConfig);
    setActivePreset('custom');
    promptConfigManager.setConfig(newConfig);
    if (onConfigChange) onConfigChange(newConfig);
  };

  // 保存自定义配置
  const handleSaveCustom = () => {
    promptConfigManager.saveConfig(config);
    alert('自定义提示词已保存到本地！');
  };

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-white/[0.02]">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/[0.05] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-emerald-500"><Icons.Settings /></span>
          <div className="text-left">
            <h3 className="text-sm font-medium text-white">提示词配置</h3>
            <p className="text-xs text-neutral-500">Prompt Configuration</p>
          </div>
        </div>
        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 border-t border-white/10 space-y-4">
          {/* Preset Selection */}
          <div>
            <label className="block text-xs text-neutral-400 mb-2 uppercase tracking-wide">
              快速预设 (Presets)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['jewelry', 'generic', 'fashion'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetChange(preset)}
                  className={`
                    px-3 py-2 text-xs rounded transition-all
                    ${activePreset === preset 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                    }
                  `}
                >
                  {preset === 'jewelry' ? '珠宝' : preset === 'generic' ? '通用' : '服装'}
                </button>
              ))}
            </div>
            {activePreset === 'custom' && (
              <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                <span>⚡</span> 当前使用自定义配置
              </div>
            )}
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-xs text-neutral-400 mb-2">
              产品类型名称
            </label>
            <input
              type="text"
              value={config.productType}
              onChange={(e) => updateField(['productType'], e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
              placeholder="例如: 珠宝设计"
            />
          </div>

          {/* Analysis System Role */}
          <div>
            <label className="block text-xs text-neutral-400 mb-2">
              分析角色描述 (Analysis Role)
            </label>
            <textarea
              value={config.analysisPrompt.systemRole}
              onChange={(e) => updateField(['analysisPrompt', 'systemRole'], e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none resize-none"
              rows={2}
              placeholder="例如: Analyze this jewelry design image..."
            />
          </div>

          {/* Generation System Role */}
          <div>
            <label className="block text-xs text-neutral-400 mb-2">
              生成角色描述 (Generation Role)
            </label>
            <textarea
              value={config.generationPrompt.systemRole}
              onChange={(e) => updateField(['generationPrompt', 'systemRole'], e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none resize-none"
              rows={2}
              placeholder="例如: Act as a world-class designer..."
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveCustom}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Icons.Save />
            保存自定义配置
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptEditor;

