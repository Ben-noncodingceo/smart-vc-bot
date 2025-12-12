import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { callLLM, parseJSONWithRetry } from '../lib/llmClient';
import { getProfileExtractionPrompt, getStagedAnalysisPrompt } from '../lib/prompts';
import { truncateText } from '../lib/fileParser';
import { CompanyProfile, AnalysisResult, AnalysisStage, ANALYSIS_STAGES } from '../types';

interface StagedAnalysisState {
  currentStage: AnalysisStage | null;
  completedStages: AnalysisStage[];
  stageResults: Partial<AnalysisResult>[];
  companyProfile: CompanyProfile | null;
}

export function useStagedAnalysis() {
  const {
    providerId,
    apiKey,
    documentText,
    setAnalysisError,
  } = useAppStore();

  const [stagedState, setStagedState] = useState<StagedAnalysisState>({
    currentStage: null,
    completedStages: [],
    stageResults: [],
    companyProfile: null
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * Start staged analysis - Extract company profile first
   */
  const startStagedAnalysis = async () => {
    if (!providerId || !apiKey || !documentText) {
      setAnalysisError('缺少必要参数：请选择供应商、输入 API Key 并上传文件');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Step 1: Extract Company Profile
      const truncatedText = truncateText(documentText, 15000);
      const profilePrompts = getProfileExtractionPrompt(truncatedText);

      const profileResponse = await callLLM({
        providerId,
        apiKey,
        systemPrompt: profilePrompts.systemPrompt,
        userPrompt: profilePrompts.userPrompt
      });

      const companyProfile: CompanyProfile = await parseJSONWithRetry({
        providerId,
        apiKey,
        rawResponse: profileResponse
      });

      setStagedState({
        currentStage: null,
        completedStages: [],
        stageResults: [],
        companyProfile
      });

      setAnalysisError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setAnalysisError(`分析失败：${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Analyze a specific stage
   */
  const analyzeStage = async (stage: AnalysisStage) => {
    if (!providerId || !apiKey || !documentText || !stagedState.companyProfile) {
      setAnalysisError('缺少必要参数');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setStagedState(prev => ({ ...prev, currentStage: stage }));

    try {
      const documentSummary = truncateText(documentText, 8000);

      const stagePrompts = getStagedAnalysisPrompt(
        stage,
        stagedState.companyProfile,
        documentSummary
      );

      const stageResponse = await callLLM({
        providerId,
        apiKey,
        systemPrompt: stagePrompts.systemPrompt,
        userPrompt: stagePrompts.userPrompt
      });

      const stageResult: Partial<AnalysisResult> = await parseJSONWithRetry({
        providerId,
        apiKey,
        rawResponse: stageResponse
      });

      // Add company profile to result
      stageResult.companyProfile = stagedState.companyProfile;

      setStagedState(prev => ({
        ...prev,
        currentStage: null,
        completedStages: [...prev.completedStages, stage],
        stageResults: [...prev.stageResults, stageResult]
      }));

      setAnalysisError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setAnalysisError(`阶段 ${stage} 分析失败：${errorMessage}`);
      setStagedState(prev => ({ ...prev, currentStage: null }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Get combined results from all completed stages
   */
  const getCombinedResults = (): AnalysisResult | null => {
    if (!stagedState.companyProfile) return null;

    const combined: any = {
      companyProfile: stagedState.companyProfile
    };

    // Merge all stage results
    stagedState.stageResults.forEach(result => {
      Object.assign(combined, result);
    });

    return combined;
  };

  /**
   * Reset staged analysis
   */
  const resetStagedAnalysis = () => {
    setStagedState({
      currentStage: null,
      completedStages: [],
      stageResults: [],
      companyProfile: null
    });
  };

  /**
   * Get next stage to analyze
   */
  const getNextStage = (): AnalysisStage | null => {
    const allStages: AnalysisStage[] = [1, 2, 3, 4];
    const nextStage = allStages.find(s => !stagedState.completedStages.includes(s));
    return nextStage || null;
  };

  /**
   * Check if all stages are completed
   */
  const isAllStagesCompleted = (): boolean => {
    return stagedState.completedStages.length === 4;
  };

  return {
    isAnalyzing,
    stagedState,
    startStagedAnalysis,
    analyzeStage,
    getCombinedResults,
    resetStagedAnalysis,
    getNextStage,
    isAllStagesCompleted,
    ANALYSIS_STAGES
  };
}
