import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { callLLM, parseJSONWithRetry } from '../lib/llmClient';
import { getProfileExtractionPrompt, getAnalysisPrompt, getChatPrompt } from '../lib/prompts';
import { truncateText } from '../lib/fileParser';
import { CompanyProfile, AnalysisResult } from '../types';

export function useAnalysis() {
  const {
    providerId,
    apiKey,
    documentText,
    selectedItems,
    setCompanyProfile,
    setAnalysisResult,
    setAnalysisStatus,
    setAnalysisError,
    addChatMessage
  } = useAppStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * Start the analysis process
   */
  const startAnalysis = async () => {
    if (!providerId || !apiKey || !documentText) {
      setAnalysisError('缺少必要参数：请选择供应商、输入 API Key 并上传文件');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStatus('parsing');

    try {
      // Step 1: Extract Company Profile
      setAnalysisStatus('extractingProfile');

      const truncatedText = truncateText(documentText, 15000);
      const profilePrompts = getProfileExtractionPrompt(truncatedText);

      const profileResponse = await callLLM({
        providerId,
        apiKey,
        systemPrompt: profilePrompts.systemPrompt,
        userPrompt: profilePrompts.userPrompt,
        timeoutMs: 120000 // 2 minutes for profile extraction
      });

      const companyProfile: CompanyProfile = await parseJSONWithRetry({
        providerId,
        apiKey,
        rawResponse: profileResponse
      });

      setCompanyProfile(companyProfile);

      // Step 2: Multi-dimensional Analysis
      setAnalysisStatus('stage1');

      // Create a shorter summary for analysis
      const documentSummary = truncateText(documentText, 8000);

      const analysisPrompts = getAnalysisPrompt(
        companyProfile,
        documentSummary,
        selectedItems
      );

      // Use longer timeout based on number of selected items
      // More items = more complex analysis = longer processing time
      const analysisTimeoutMs = selectedItems.length > 5 ? 300000 : 180000;

      const analysisResponse = await callLLM({
        providerId,
        apiKey,
        systemPrompt: analysisPrompts.systemPrompt,
        userPrompt: analysisPrompts.userPrompt,
        timeoutMs: analysisTimeoutMs
      });

      const analysisResult: AnalysisResult = await parseJSONWithRetry({
        providerId,
        apiKey,
        rawResponse: analysisResponse
      });

      // Ensure companyProfile is included in the result
      analysisResult.companyProfile = companyProfile;

      setAnalysisResult(analysisResult);
      setAnalysisStatus('done');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setAnalysisError(`分析失败：${errorMessage}`);
      setAnalysisStatus('error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Send a chat message
   */
  const sendChatMessage = async (userMessage: string) => {
    if (!providerId || !apiKey) {
      throw new Error('缺少必要参数');
    }

    const store = useAppStore.getState();
    const { companyProfile, analysisResult, documentText, chatMessages } = store;

    if (!companyProfile || !analysisResult) {
      throw new Error('请先完成分析');
    }

    // Add user message
    const userChatMessage = {
      role: 'user' as const,
      content: userMessage,
      timestamp: Date.now()
    };
    addChatMessage(userChatMessage);

    // Prepare chat history
    const chatHistory = [...chatMessages, userChatMessage].map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get chat prompts
    const chatPrompts = getChatPrompt(
      companyProfile,
      analysisResult,
      truncateText(documentText, 5000),
      chatHistory,
      userMessage
    );

    // Call LLM
    const response = await callLLM({
      providerId,
      apiKey,
      systemPrompt: chatPrompts.systemPrompt,
      userPrompt: chatPrompts.userPrompt,
      timeoutMs: 120000 // 2 minutes for chat responses
    });

    // Add assistant message
    const assistantMessage = {
      role: 'assistant' as const,
      content: response,
      timestamp: Date.now()
    };
    addChatMessage(assistantMessage);

    return response;
  };

  return {
    isAnalyzing,
    startAnalysis,
    sendChatMessage
  };
}
