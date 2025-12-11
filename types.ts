
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type ImageResolution = '1K' | '2K' | '4K';

export interface JewelryConfig {
  material: string;
  craftsmanship: string;
  chainType: string;
  extraElements: string;
  audience: string;
  miscPrompts: string;
  creativityStrength: number;
  aspectRatio: AspectRatio;
  resolution: ImageResolution;
  // Data Analysis Mock Filters
  minRanking: number;
  minSearchVolume: number;
  minSales: number;
  maxPPC: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  status?: 'loading' | 'success' | 'error';
  tags?: string[];
  saved?: boolean;
  config?: JewelryConfig;
}

export interface ReferenceSlot {
  id: number;
  image: string | null; // base64
}

export interface ImageAnalysis {
  designConcept: string; // 设计思路
  style: string; // 设计风格
  audience: string; // 人群
  emotionalPoint: string; // 客户购买情绪点
  scenario: string; // 使用场景
  corePoint: string; // 开发要抓住的核心点
}

export interface KeywordItem {
  name: string;
  count: number; // Frequency
}

export interface KeywordCategory {
  label: string;
  key: string;
  items: KeywordItem[];
}

export type KeywordAnalysis = {
  [key in 'color' | 'material' | 'stone' | 'craftsmanship' | 'style' | 'element']: KeywordCategory;
};

export interface CreativeConcept {
  title: string;
  reasoning: string;
  config: Partial<JewelryConfig>;
}

export interface MarketDataState {
  isAnalyzing: boolean;
  isAnalyzed: boolean;
  data: KeywordAnalysis;
}
