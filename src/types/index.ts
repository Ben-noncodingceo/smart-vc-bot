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

// Analysis Options - New 8 dimensions
export type AnalysisItemId =
  | 'industryBackground'      // 行业背景简述
  | 'nationalPolicy'          // 国家政策简述
  | 'marketDemand'            // 市场需求分析
  | 'technologyStatus'        // 技术现状（前沿论文）
  | 'applicationTrends'       // 应用趋势
  | 'businessModel'           // 商业模式
  | 'industryEcosystem'       // 产业格局、上下游关系
  | 'investmentOpportunity';  // 投资机会、投资价值

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

// 1. Industry Background Analysis (行业背景简述)
export interface IndustryBackgroundAnalysis {
  industryOverview: string;          // 行业概况
  marketSize: {                      // 市场规模
    global?: number | null;
    china?: number | null;
    currency: string;
    year: number;
  };
  keyPlayers: string[];              // 主要参与者
  developmentStage: string;          // 发展阶段
  notes?: string;
}

// 2. National Policy Analysis (国家政策简述)
export interface NationalPolicyAnalysis {
  relevantPolicies: {                // 相关政策
    policyName: string;
    issuingAuthority: string;        // 发布机构
    effectiveDate?: string;
    summary: string;
  }[];
  policySupport: 'strong' | 'moderate' | 'weak' | 'unknown';  // 政策支持力度
  regulatoryRisks: string[];         // 监管风险
  notes?: string;
}

// 3. Market Demand Analysis (市场需求分析)
export interface MarketDemandAnalysis {
  targetCustomers: string[];         // 目标客户群体
  painPoints: string[];              // 客户痛点
  marketGrowthRate?: number | null;  // 市场增长率 (%)
  demandDrivers: string[];           // 需求驱动因素
  competitiveLandscape: string;      // 竞争格局描述
  notes?: string;
}

// 4. Technology Status Analysis (技术现状 - 前沿论文)
export interface PaperInfo {
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  link?: string;
  summary: string;
  keyChallenges: string;
}

export interface TechnologyStatusAnalysis {
  technologyOverview: string;        // 技术概况
  coreTechnologies: string[];        // 核心技术
  technologyMaturity: 'early' | 'growing' | 'mature' | 'declining';  // 技术成熟度
  papers: PaperInfo[];               // 前沿论文（5篇）
  technicalBarriers: string[];       // 技术壁垒
  notes?: string;
}

// 5. Application Trends Analysis (应用趋势)
export interface ApplicationTrendsAnalysis {
  currentApplications: string[];     // 当前应用场景
  emergingApplications: string[];    // 新兴应用场景
  adoptionRate: 'high' | 'medium' | 'low' | 'unknown';  // 应用普及率
  futureProspects: string;           // 未来前景
  timeHorizon: string;               // 时间范围
  notes?: string;
}

// 6. Business Model Analysis (商业模式)
export interface BusinessModelAnalysis {
  revenueStreams: string[];          // 收入来源
  costStructure: string;             // 成本结构
  valueProposition: string;          // 价值主张
  customerChannels: string[];        // 客户渠道
  keyResources: string[];            // 关键资源
  keyActivities: string[];           // 关键活动
  scalability: 'high' | 'medium' | 'low';  // 可扩展性
  notes?: string;
}

// 7. Industry Ecosystem Analysis (产业格局、上下游关系)
export interface IndustryEcosystemAnalysis {
  upstreamSuppliers: {               // 上游供应商
    category: string;
    keyPlayers: string[];
    bargainingPower: 'strong' | 'moderate' | 'weak';
  }[];
  downstreamCustomers: {             // 下游客户
    category: string;
    keyPlayers: string[];
    bargainingPower: 'strong' | 'moderate' | 'weak';
  }[];
  competitors: {                     // 主要竞争对手
    name: string;
    marketShare?: number | null;
    strengths: string[];
    weaknesses: string[];
  }[];
  valueChainPosition: string;        // 价值链定位
  notes?: string;
}

// 8. Investment Opportunity Analysis (投资机会、投资价值)
export interface InvestmentOpportunityAnalysis {
  investmentRating: 'high' | 'medium' | 'low';  // 投资评级
  keyInvestmentHighlights: string[]; // 关键投资亮点
  riskFactors: string[];             // 风险因素
  valuationRange?: {                 // 估值区间
    min: number | null;
    max: number | null;
    currency: string;
  };
  exitStrategy: string[];            // 退出策略
  recommendedInvestmentStage: string;  // 建议投资阶段
  targetReturn?: string;             // 目标回报
  timeframe?: string;                // 投资周期
  notes?: string;
}

// Complete Analysis Result
export interface AnalysisResult {
  companyProfile: CompanyProfile;
  industryBackground?: IndustryBackgroundAnalysis | null;
  nationalPolicy?: NationalPolicyAnalysis | null;
  marketDemand?: MarketDemandAnalysis | null;
  technologyStatus?: TechnologyStatusAnalysis | null;
  applicationTrends?: ApplicationTrendsAnalysis | null;
  businessModel?: BusinessModelAnalysis | null;
  industryEcosystem?: IndustryEcosystemAnalysis | null;
  investmentOpportunity?: InvestmentOpportunityAnalysis | null;
}

// Staged Analysis
export type AnalysisStage = 1 | 2 | 3 | 4;

export interface StagedAnalysisConfig {
  stage: AnalysisStage;
  label: string;
  description: string;
  items: AnalysisItemId[];
}

export const ANALYSIS_STAGES: StagedAnalysisConfig[] = [
  {
    stage: 1,
    label: '行业与政策背景',
    description: '分析行业背景和国家政策环境',
    items: ['industryBackground', 'nationalPolicy']
  },
  {
    stage: 2,
    label: '市场与技术分析',
    description: '分析市场需求和技术现状',
    items: ['marketDemand', 'technologyStatus']
  },
  {
    stage: 3,
    label: '应用与商业模式',
    description: '分析应用趋势和商业模式',
    items: ['applicationTrends', 'businessModel']
  },
  {
    stage: 4,
    label: '产业生态与投资价值',
    description: '分析产业格局和投资机会',
    items: ['industryEcosystem', 'investmentOpportunity']
  }
];

// Analysis Status
export type AnalysisStatus =
  | 'idle'
  | 'parsing'
  | 'extractingProfile'
  | 'stage1' | 'stage2' | 'stage3' | 'stage4'
  | 'done'
  | 'error';

export interface StagedAnalysisState {
  currentStage: AnalysisStage | null;
  completedStages: AnalysisStage[];
  stageResults: {
    [key in AnalysisStage]?: Partial<AnalysisResult>;
  };
}

// Chat Message
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
