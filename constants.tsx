import React from 'react';
import { JewelryConfig, KeywordAnalysis } from './types';

export const DEFAULT_CONFIG: JewelryConfig = {
  material: '',
  craftsmanship: '',
  chainType: '',
  extraElements: '',
  audience: '',
  miscPrompts: '',
  creativityStrength: 40,
  aspectRatio: '1:1',
  resolution: '1K',
  minRanking: 50000,
  minSearchVolume: 1000,
  minSales: 50,
  maxPPC: 5,
};

export const MOCK_ANALYSIS_DATA: KeywordAnalysis = {
  color: {
    label: '颜色 (Color)',
    key: 'color',
    items: [
      { name: 'Rose Gold (玫瑰金)', count: 1250 },
      { name: 'Silver White (银白)', count: 980 },
      { name: 'Emerald Green (祖母绿)', count: 450 },
      { name: 'Royal Blue (皇家蓝)', count: 320 },
      { name: 'Ruby Red (宝石红)', count: 210 },
      { name: 'Black (黑色)', count: 180 },
    ]
  },
  material: {
    label: '材质 (Material)',
    key: 'material',
    items: [
      { name: '18K Gold (18K金)', count: 1500 },
      { name: '925 Silver (925银)', count: 1100 },
      { name: 'Platinum (铂金)', count: 600 },
      { name: 'Brass (黄铜)', count: 300 },
      { name: 'Titanium (钛金)', count: 150 },
    ]
  },
  stone: {
    label: '石头 (Stone)',
    key: 'stone',
    items: [
      { name: 'Diamond (钻石)', count: 2200 },
      { name: 'Moissanite (莫桑石)', count: 800 },
      { name: 'Pearl (珍珠)', count: 650 },
      { name: 'Onyx (玛瑙)', count: 400 },
      { name: 'Sapphire (蓝宝石)', count: 350 },
      { name: 'Zircon (锆石)', count: 300 },
    ]
  },
  craftsmanship: {
    label: '工艺 (Craftsmanship)',
    key: 'craftsmanship',
    items: [
      { name: 'Micro-pave (微镶)', count: 950 },
      { name: 'Filigree (花丝)', count: 540 },
      { name: 'Enamel (珐琅)', count: 320 },
      { name: 'Matte Finish (哑光)', count: 280 },
      { name: 'Hammered (锤纹)', count: 150 },
      { name: 'Polished (抛光)', count: 1100 },
    ]
  },
  style: {
    label: '风格 (Style)',
    key: 'style',
    items: [
      { name: 'Vintage (复古)', count: 780 },
      { name: 'Minimalist (极简)', count: 1300 },
      { name: 'Luxury (奢华)', count: 900 },
      { name: 'Bohemian (波西米亚)', count: 450 },
      { name: 'Art Deco (艺术装饰)', count: 320 },
      { name: 'Gothic (哥特)', count: 150 },
    ]
  },
  element: {
    label: '元素 (Element)',
    key: 'element',
    items: [
      { name: 'Heart (心形)', count: 1450 },
      { name: 'Infinity (无限符号)', count: 890 },
      { name: 'Butterfly (蝴蝶)', count: 670 },
      { name: 'Cross (十字架)', count: 520 },
      { name: 'Snake (蛇形)', count: 340 },
      { name: 'Star (星星)', count: 290 },
      { name: 'Flower (花朵)', count: 600 },
    ]
  }
};

export const Icons = {
  Diamond: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 2.25l-7.5 7.5 2.25 9.75h10.5l2.25-9.75L12 2.25zm0 2.625l5.25 5.25H6.75L12 4.875zm-6.18 6.75h12.36l-1.68 7.275H7.5l-1.68-7.275z" />
    </svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 9l2.846-.813a4.5 4.5 0 003.09-3.09L9 2.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 9l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 3.844L18 4.75l-.259-.906a3 3 0 00-2.133-2.133L14.703 1.5 15.609.594a3 3 0 002.133 2.133L18 3.844l.259-.906a3 3 0 002.133-2.133l.906.906a3 3 0 00-2.133 2.133zM19.5 13.5l-.234.938a1.5 1.5 0 00-1.078 1.078l-.938.234.938.234a1.5 1.5 0 001.078 1.078l.234.938.234-.938a1.5 1.5 0 001.078-1.078l.938-.234-.938-.234a1.5 1.5 0 00-1.078-1.078l-.234-.938z" />
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 18H7.5M3.75 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 18H7.5M3.75 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 18H7.5M3.75 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0" />
    </svg>
  ),
  Database: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  Filter: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
    </svg>
  ),
  Heart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  HeartSolid: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  ),
  Refresh: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  Document: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  Save: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  )
};