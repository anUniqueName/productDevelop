import { PromptConfig, getCurrentPromptConfig } from '../config/prompts.config';

/**
 * 全局提示词配置管理器
 * 支持运行时动态切换提示词配置
 */
class PromptConfigManager {
  private currentConfig: PromptConfig;

  constructor() {
    // 尝试从 localStorage 加载自定义配置
    const saved = localStorage.getItem('customPromptConfig');
    if (saved) {
      try {
        this.currentConfig = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load custom prompt config:', e);
        this.currentConfig = getCurrentPromptConfig();
      }
    } else {
      this.currentConfig = getCurrentPromptConfig();
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): PromptConfig {
    return this.currentConfig;
  }

  /**
   * 设置新配置
   */
  setConfig(config: PromptConfig): void {
    this.currentConfig = config;
  }

  /**
   * 保存配置到 localStorage
   */
  saveConfig(config: PromptConfig): void {
    this.currentConfig = config;
    localStorage.setItem('customPromptConfig', JSON.stringify(config));
  }

  /**
   * 清除自定义配置，恢复默认
   */
  resetToDefault(): void {
    localStorage.removeItem('customPromptConfig');
    this.currentConfig = getCurrentPromptConfig();
  }
}

// 导出单例
export const promptConfigManager = new PromptConfigManager();

