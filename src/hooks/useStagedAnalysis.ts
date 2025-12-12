import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { callLLM, parseJSONWithRetry } from '../lib/llmClient';
import { getProfileExtractionPrompt, getStagedAnalysisPrompt } from '../lib/prompts';
import { truncateText } from '../lib/fileParser';
import { CompanyProfile, AnalysisResult, AnalysisStage, ANALYSIS_STAGES } from '../types';

export function useStagedAnalysis() {
  const {
    providerId,
    apiKey,
    documentText,
    companyProfile,
    currentStage,
    completedStages,
    stageResults,
    setCompanyProfile,
    setAnalysisResult,
    setAnalysisError,
    setCurrentStage,
    addCompletedStage,
    resetStagedAnalysis: resetStoreState
  } = useAppStore();

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

      const extractedProfile: CompanyProfile = await parseJSONWithRetry({
        providerId,
        apiKey,
        rawResponse: profileResponse
      });

      setCompanyProfile(extractedProfile);
      resetStoreState(); // Clear any previous staged analysis
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
    if (!providerId || !apiKey || !documentText || !companyProfile) {
      setAnalysisError('缺少必要参数');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setCurrentStage(stage);

    try {
      const documentSummary = truncateText(documentText, 8000);

      const stagePrompts = getStagedAnalysisPrompt(
        stage,
        companyProfile,
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
      stageResult.companyProfile = companyProfile;

      addCompletedStage(stage, stageResult);

      // Update the global analysisResult with combined results for chat functionality
      const combined = getCombinedResults();
      if (combined) {
        setAnalysisResult(combined);
      }

      setAnalysisError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setAnalysisError(`阶段 ${stage} 分析失败：${errorMessage}`);
      setCurrentStage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Get combined results from all completed stages
   */
  const getCombinedResults = (): AnalysisResult | null => {
    if (!companyProfile) return null;

    const combined: any = {
      companyProfile: companyProfile
    };

    // Merge all stage results
    stageResults.forEach(result => {
      Object.assign(combined, result);
    });

    return combined;
  };

  /**
   * Get next stage to analyze
   */
  const getNextStage = (): AnalysisStage | null => {
    const allStages: AnalysisStage[] = [1, 2, 3, 4];
    const nextStage = allStages.find(s => !completedStages.includes(s));
    return nextStage || null;
  };

  /**
   * Check if all stages are completed
   */
  const isAllStagesCompleted = (): boolean => {
    return completedStages.length === 4;
  };

  return {
    isAnalyzing,
    companyProfile,
    currentStage,
    completedStages,
    stageResults,
    startStagedAnalysis,
    analyzeStage,
    getCombinedResults,
    resetStagedAnalysis: resetStoreState,
    getNextStage,
    isAllStagesCompleted,
    ANALYSIS_STAGES
  };
}
