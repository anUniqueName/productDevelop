import { useState } from 'react';
import { analyzeJewelryImage } from '../services/geminiService.secure';
import { ImageAnalysis } from '../types';

export const useJewelryAnalysis = () => {
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (base64Image: string) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);
    try {
      const result = await analyzeJewelryImage(base64Image);
      setAnalysis(result);
    } catch (err: any) {
      console.error("Analysis failed", err);
      setError("Failed to analyze image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analysis, isAnalyzing, analyze, error };
};