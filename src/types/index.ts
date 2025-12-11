// Provider Types
export type ProviderId = 'doubao' | 'deepseek' | 'openai' | 'tongyi';

export interface ProviderConfig {
  id: ProviderId;
  displayName: string;
  baseUrl: string;
  model: string;
  apiKeyHeaderName: string;
  buildRequestBody: (params: {
    systemPrompt: string;
    userPrompt: string;
  }) => any;
  extractContent: (response: any) => string;
}

// Analysis Options
export type AnalysisItemId =
  | 'marketCap'
  | 'frontier'
  | 'publicPeers'
  | 'stage'
  | 'revenue'
  | 'profit'
  | 'policyRisk'
  | 'investmentValue'
  | 'financingCases'
  | 'papers';

export interface AnalysisOption {
  id: AnalysisItemId;
  label: string;
  description: string;
}

export interface AnalysisOptionsState {
  selectedItems: AnalysisItemId[];
}

// Company Profile
export interface CompanyProfile {
  name: string;
  countryOrRegion: string;
  industry: string;
  isHighTech: boolean;
  shortDescription: string;
  inferredStage?: 'seed' | 'preA' | 'seriesA' | 'seriesB' | 'seriesC' | 'preIPO' | 'unknown';
  revenueByYear?: {
    year: number;
    amount: number | null;
    currency?: string;
    note?: string;
  }[];
}

// Market Cap Analysis
export interface MarketCapAnalysis {
  industryDefinition: string;
  globalMarketCapRange?: {
    min: number | null;
    max: number | null;
    currency: string;
  };
  keyPublicCompanies?: {
    name: string;
    ticker?: string;
    exchange?: string;
    country?: string;
  }[];
  notes?: string;
}

// Frontier Analysis
export interface FrontierAnalysis {
  keyTrends: string[];
  timeHorizon: string;
  notes?: string;
}

// Public Peers Analysis
export interface PublicPeer {
  name: string;
  ticker?: string;
  exchange?: string;
  country?: string;
  isComparable: boolean;
  reason?: string;
  last3YearsCoreMetrics?: {
    year: number;
    revenue?: number | null;
    profit?: number | null;
    marketCap?: number | null;
    currency?: string;
  }[];
}

export interface PublicPeersAnalysis {
  hasComparablePeers: boolean;
  peers: PublicPeer[];
  notes?: string;
}

// Stage Analysis
export interface StageAnalysis {
  stage: CompanyProfile['inferredStage'];
  reasoning: string;
}

// Profit Analysis
export interface ProfitAnalysis {
  currentStatus: 'profitable' | 'lossMaking' | 'breakeven' | 'unknown';
  unitEconomics?: string;
  potentialPathToProfitability?: string;
}

// Policy Risk Analysis
export interface PolicyRiskAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  keyRisks: string[];
  jurisdictions: string[];
}

// Investment Value Analysis
export interface InvestmentValueAnalysis {
  rating: 'high' | 'medium' | 'low';
  keyUpsides: string[];
  keyRisks: string[];
  targetInvestorProfile?: string;
}

// Financing Cases Analysis
export interface FinancingCase {
  companyName: string;
  region?: string;
  round?: string;
  amount?: number | null;
  currency?: string;
  date?: string;
  leadInvestors?: string[];
}

export interface FinancingCasesAnalysis {
  cases: FinancingCase[];
  notes?: string;
}

// Papers Analysis
export interface PaperInfo {
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  link?: string;
  summary: string;
  keyChallenges: string;
}

export interface PapersAnalysis {
  isHighTechIndustry: boolean;
  papers: PaperInfo[];
  notes?: string;
}

// Complete Analysis Result
export interface AnalysisResult {
  companyProfile: CompanyProfile;
  marketCap?: MarketCapAnalysis | null;
  frontier?: FrontierAnalysis | null;
  publicPeers?: PublicPeersAnalysis | null;
  stage?: StageAnalysis | null;
  revenue?: CompanyProfile['revenueByYear'] | null;
  profit?: ProfitAnalysis | null;
  policyRisk?: PolicyRiskAnalysis | null;
  investmentValue?: InvestmentValueAnalysis | null;
  financingCases?: FinancingCasesAnalysis | null;
  papers?: PapersAnalysis | null;
}

// Analysis Status
export type AnalysisStatus =
  | 'idle'
  | 'parsing'
  | 'extractingProfile'
  | 'analyzing'
  | 'done'
  | 'error';

// Chat Message
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
