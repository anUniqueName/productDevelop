
import { useState } from 'react';
import { CreativeConcept, ImageAnalysis } from '../types';

export const useInspiration = () => {
  const [ideaInput, setIdeaInput] = useState("");
  const [isIdeaGenerating, setIsIdeaGenerating] = useState(false);
  const [generatedConcepts, setGeneratedConcepts] = useState<CreativeConcept[]>([]);

  const generateConcepts = (analysis: ImageAnalysis | null) => {
    setIsIdeaGenerating(true);
    
    // Simulate thinking delay for better UX
    setTimeout(() => {
        const concepts: CreativeConcept[] = [];
        
        let baseCore = ideaInput.trim() || "Jewelry Piece";
        let baseStyle = "Classic";

        if (analysis) {
            baseCore = analysis.corePoint || analysis.designConcept;
            baseStyle = analysis.style || "Classic";
        }

        const addConcept = (title: string, reasoning: string, styleMod: string, audienceMod: string, matMod: string, extraMod: string) => {
            concepts.push({
                title,
                reasoning,
                config: {
                    material: matMod,
                    craftsmanship: "High Quality",
                    extraElements: extraMod,
                    miscPrompts: `Keep Core Feature: "${baseCore}". Apply Style: ${styleMod}. Context: ${reasoning}`,
                    audience: audienceMod
                }
            });
        };

        // 1. Deep Style
        addConcept(`🔥 极致风格 (Deep ${baseStyle})`, `Maximizing "${baseStyle}" aesthetic.`, `Extreme ${baseStyle}`, `Hardcore ${baseStyle} Lovers`, "Premium Metal", "Intricate Details");
        // 2. Minimalist
        addConcept(`✨ 极简通勤 (Minimalist)`, `Stripping "${baseCore}" to essence.`, "Minimalist, Geometric, Bauhaus", "Office Ladies", "18K Gold, Plain", "None");
        // 3. Luxury
        addConcept(`💎 奢华高定 (Haute Couture)`, `Elevating concept with diamonds.`, "High Jewelry, Pave setting", "High Net Worth", "Platinum, VVS Diamonds", "Halo, Pave");
        // 4. Y2K
        addConcept(`🪐 千禧辣妹 (Y2K Cyber)`, `Fluid metal & chunky aesthetics.`, "Y2K, Cyberpunk, Liquid Metal", "Gen Z", "Liquid Silver, Chrome", "Molten Texture");
        // 5. Vintage
        addConcept(`🕰️ 复古名伶 (Vintage)`, `Historical elegance.`, "Vintage, Art Deco, Great Gatsby", "Collectors", "Rose Gold, Oxidized", "Filigree");
        // 6. Gothic
        addConcept(`🖤 暗黑美学 (Gothic)`, `Darker, edgier take.`, "Gothic, Dark, Vampire aesthetic", "Alternative", "Black Gold, Onyx", "Thorns");
        // 7. Dopamine
        addConcept(`🌈 多巴胺色彩 (Dopamine)`, `Vivid enamel & colors.`, "Pop Art, Vivid, Candy-colored", "Fashion Youth", "Gold, Enamel", "Color blocking");
        // 8. Organic
        addConcept(`🌿 自然有机 (Organic)`, `Raw textures & nature.`, "Organic, Wabi-sabi, Botanical", "Eco-conscious", "Recycled Gold", "Vine texture");
        // 9. Unisex
        addConcept(`⚖️ 无性别主义 (Unisex)`, `Bolder, simpler, gender-neutral.`, "Unisex, Brutalist, Chunky", "Streetwear", "Heavy Silver", "Industrial Hardware");
        // 10. Avant-Garde
        addConcept(`🎨 艺术雕塑 (Avant-Garde)`, `Wearable sculpture.`, "Avant-Garde, Abstract, Surrealist", "Art Collectors", "Mixed Metals", "Abstract Forms");

        setGeneratedConcepts(concepts);
        setIsIdeaGenerating(false);
    }, 800);
  };

  return {
    ideaInput,
    setIdeaInput,
    isIdeaGenerating,
    generatedConcepts,
    generateConcepts
  };
};
