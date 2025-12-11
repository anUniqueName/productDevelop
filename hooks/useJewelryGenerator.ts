import { useState } from 'react';
import { GeneratedImage, JewelryConfig } from '../types';
import { generateJewelryDesign } from '../services/geminiService';

export const useJewelryGenerator = () => {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (
    config: JewelryConfig, 
    referenceImage: string | null,
    tags: string[]
  ) => {
    if (isCoolingDown) return;

    setIsCoolingDown(true);
    // Set 2 second cooldown
    setTimeout(() => {
      setIsCoolingDown(false);
    }, 2000);
    setError(null);

    // Create a placeholder for loading state
    const tempId = Date.now().toString();
    const placeholder: GeneratedImage = {
        id: tempId,
        url: '', // Empty URL for loading
        prompt: config.miscPrompts,
        timestamp: Date.now(),
        status: 'loading',
        tags: tags,
        saved: false,
        config: config // Store the full config used
    };

    setGeneratedImages(prev => [placeholder, ...prev]);

    try {
      const resultImageUrl = await generateJewelryDesign(referenceImage, config);
      
      // Update the placeholder with the actual result
      setGeneratedImages(prev => prev.map(img => 
        img.id === tempId 
            ? { ...img, url: resultImageUrl, status: 'success' } 
            : img
      ));

    } catch (err: any) {
        console.error(err);
        let msg = "Generation failed. Please try again.";
        if (err.message && (err.message.includes("API Key") || err.message.includes("Access Denied"))) {
            msg = "API Key Error: Please ensure you have selected a valid paid project key for high-quality generation.";
        } else if (err.message && err.message.includes("permission")) {
            msg = "Permission Error: Your API key does not have access to this model. Please select a paid key.";
        } else if (err.message && err.message.includes("quota")) {
            msg = "Quota Exceeded. Please check your billing or API key limits.";
        }
        
        setError(msg);
        // Remove the placeholder if failed
        setGeneratedImages(prev => prev.filter(img => img.id !== tempId));
    }
  };

  const toggleSave = (id: string) => {
      setGeneratedImages(prev => prev.map(img => 
          img.id === id ? { ...img, saved: !img.saved } : img
      ));
  };

  return { generatedImages, setGeneratedImages, isCoolingDown, error, generate, toggleSave };
};