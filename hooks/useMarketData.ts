
import { useState, useRef } from 'react';
import { read, utils } from 'xlsx';
import { KeywordAnalysis, KeywordItem } from '../types';
import { MOCK_ANALYSIS_DATA } from '../constants';

export const useMarketData = () => {
  const [state, setState] = useState({
    isAnalyzing: false,
    isAnalyzed: false,
    data: MOCK_ANALYSIS_DATA,
  });

  const fullTextRef = useRef<string>("");

  const countKeywordInText = (keywordName: string, fullText: string): number => {
    const namePart = keywordName.split(' (')[0].toLowerCase();
    const chinesePart = keywordName.match(/\((.*?)\)/)?.[1]?.toLowerCase();
    
    let totalCount = 0;
    if (namePart) {
      const regexName = new RegExp(namePart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      totalCount += (fullText.match(regexName) || []).length;
    }
    if (chinesePart) {
      const regexChinese = new RegExp(chinesePart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      totalCount += (fullText.match(regexChinese) || []).length;
    }
    return totalCount;
  };

  const processFile = async (file: File) => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'array' });
        
        if (!workbook.SheetNames.length) throw new Error("Excel file is empty");

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
        
        const fullText = JSON.stringify(jsonData).toLowerCase();
        fullTextRef.current = fullText;
        
        const newData: KeywordAnalysis = JSON.parse(JSON.stringify(state.data));
        
        Object.keys(newData).forEach((key) => {
          const category = newData[key as keyof KeywordAnalysis];
          category.items.forEach((item: KeywordItem) => {
            item.count = countKeywordInText(item.name, fullText);
          });
          category.items.sort((a, b) => b.count - a.count);
        });
        
        setState({ isAnalyzing: false, isAnalyzed: true, data: newData });
      } catch (error) {
        console.error("Error processing file:", error);
        alert("文件解析失败，请确保上传有效的 Excel 或 CSV 文件。");
        setState(prev => ({ ...prev, isAnalyzing: false }));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const addCustomKeyword = (categoryKey: string, newKeyword: string) => {
    if (!newKeyword.trim()) return;
    
    setState(prev => {
        const newData = { ...prev.data };
        const category = newData[categoryKey as keyof KeywordAnalysis];
        
        if (!category.items.find(i => i.name.toLowerCase() === newKeyword.toLowerCase())) {
            const count = fullTextRef.current ? countKeywordInText(newKeyword, fullTextRef.current) : 0;
            category.items.unshift({ name: newKeyword, count });
        }
        return { ...prev, data: newData };
    });
  };

  const resetAnalysis = () => {
      setState(prev => ({ ...prev, isAnalyzed: false }));
  };

  return {
    ...state,
    processFile,
    addCustomKeyword,
    resetAnalysis
  };
};
