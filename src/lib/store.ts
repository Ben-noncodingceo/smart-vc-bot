import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ProviderId,
  AnalysisItemId,
  CompanyProfile,
  AnalysisResult,
  AnalysisStatus,
  ChatMessage,
  AnalysisStage
} from '../types';

interface AppState {
  // Provider & API Key
  providerId: ProviderId | null;
  apiKey: string;
  rememberApiKey: boolean;

  // File & Document
  uploadedFile: File | null;
  documentText: string;
  parsedFileName: string;

  // Analysis Options
  selectedItems: AnalysisItemId[];

  // Analysis Results
  companyProfile: CompanyProfile | null;
  analysisResult: AnalysisResult | null;
  analysisStatus: AnalysisStatus;
  analysisError: string | null;

  // Chat
  chatMessages: ChatMessage[];

  // Staged Analysis
  currentStage: AnalysisStage | null;
  completedStages: AnalysisStage[];
  stageResults: Partial<AnalysisResult>[];

  // Actions
  setProvider: (providerId: ProviderId) => void;
  setApiKey: (apiKey: string, remember: boolean) => void;
  setUploadedFile: (file: File | null) => void;
  setDocumentText: (text: string) => void;
  setParsedFileName: (name: string) => void;
  setSelectedItems: (items: AnalysisItemId[]) => void;
  setCompanyProfile: (profile: CompanyProfile | null) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setAnalysisError: (error: string | null) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  setCurrentStage: (stage: AnalysisStage | null) => void;
  addCompletedStage: (stage: AnalysisStage, result: Partial<AnalysisResult>) => void;
  resetStagedAnalysis: () => void;
  reset: () => void;
}

const initialState = {
  providerId: null,
  apiKey: '',
  rememberApiKey: false,
  uploadedFile: null,
  documentText: '',
  parsedFileName: '',
  selectedItems: [
    'marketCap',
    'frontier',
    'publicPeers',
    'stage',
    'revenue',
    'profit',
    'policyRisk',
    'investmentValue',
    'financingCases',
    'papers'
  ] as AnalysisItemId[],
  companyProfile: null,
  analysisResult: null,
  analysisStatus: 'idle' as AnalysisStatus,
  analysisError: null,
  chatMessages: [],
  currentStage: null,
  completedStages: [],
  stageResults: []
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setProvider: (providerId) => set({ providerId }),

      setApiKey: (apiKey, remember) =>
        set({ apiKey, rememberApiKey: remember }),

      setUploadedFile: (file) => set({ uploadedFile: file }),

      setDocumentText: (text) => set({ documentText: text }),

      setParsedFileName: (name) => set({ parsedFileName: name }),

      setSelectedItems: (items) => set({ selectedItems: items }),

      setCompanyProfile: (profile) => set({ companyProfile: profile }),

      setAnalysisResult: (result) => set({ analysisResult: result }),

      setAnalysisStatus: (status) => set({ analysisStatus: status }),

      setAnalysisError: (error) => set({ analysisError: error }),

      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message]
        })),

      clearChatMessages: () => set({ chatMessages: [] }),

      setCurrentStage: (stage) => set({ currentStage: stage }),

      addCompletedStage: (stage, result) =>
        set((state) => ({
          completedStages: [...state.completedStages, stage],
          stageResults: [...state.stageResults, result],
          currentStage: null
        })),

      resetStagedAnalysis: () =>
        set({
          currentStage: null,
          completedStages: [],
          stageResults: []
        }),

      reset: () =>
        set((state) => ({
          ...initialState,
          // Keep provider and API key if remembered
          providerId: state.rememberApiKey ? state.providerId : null,
          apiKey: state.rememberApiKey ? state.apiKey : '',
          rememberApiKey: state.rememberApiKey
        }))
    }),
    {
      name: 'ai-bp-analysis-storage',
      partialize: (state) => ({
        // Only persist these fields
        providerId: state.rememberApiKey ? state.providerId : null,
        apiKey: state.rememberApiKey ? state.apiKey : '',
        rememberApiKey: state.rememberApiKey
      })
    }
  )
);
