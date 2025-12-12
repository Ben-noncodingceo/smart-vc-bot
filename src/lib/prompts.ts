import { AnalysisItemId, CompanyProfile, AnalysisStage, ANALYSIS_STAGES } from '../types';

/**
 * Step 1: Extract Company Profile
 */
export function getProfileExtractionPrompt(documentText: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `你是一名投研分析师。你将看到一份创业公司 BP 或企业介绍文档的文本内容。
请从中提取企业的基础信息，并以 JSON 格式返回，必须严格符合给定的 TypeScript 接口 CompanyProfile，不要输出多余文字。

CompanyProfile 接口定义：
{
  name: string; // 公司名称
  countryOrRegion: string; // 主要所在国家或地区
  industry: string; // 简要的行业名称
  isHighTech: boolean; // 是否依赖核心科技创新
  shortDescription: string; // 1-2句话总结企业业务
  inferredStage?: 'seed' | 'preA' | 'seriesA' | 'seriesB' | 'seriesC' | 'preIPO' | 'unknown';
  revenueByYear?: Array<{ year: number; amount: number | null; currency?: string; note?: string }>;
}`;

  const userPrompt = `以下是企业 BP / 介绍文档的文本内容：

"""
${documentText}
"""

请提取并返回一个 JSON，对应 CompanyProfile 类型。字段要求如下：

- name: 公司名称（若无法确定，用 "Unknown"）
- countryOrRegion: 公司主要所在国家或地区（若无法确定，用 "Unknown"）
- industry: 简要的行业名称（中文或英文均可）
- isHighTech: 若企业主要依赖核心科技创新（如 AI、芯片、生物医药、硬科技等），填 true，否则 false
- shortDescription: 用 1–2 句话总结企业业务（中文）
- inferredStage: 从 seed / preA / seriesA / seriesB / seriesC / preIPO / unknown 中选一个，基于融资轮次、团队规模、收入体量等综合判断
- revenueByYear: 如果文档中有收入数据，列出近几年收入；如果没有，可以为空数组

只输出 JSON，不要解释。`;

  return { systemPrompt, userPrompt };
}

/**
 * Step 2: Multi-dimensional Analysis
 */
export function getAnalysisPrompt(
  companyProfile: CompanyProfile,
  documentSummary: string,
  selectedItems: AnalysisItemId[]
): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `你是一名专业的 TMT / 高科技方向投研分析师。你会基于企业的 BP 文档内容与自身知识，对该企业及其所在行业进行多维度分析。
所有输出必须使用 JSON，严格匹配给定的 TypeScript 类型 AnalysisResult。

重要规则：
1. 充分利用给定的 CompanyProfile 和文档摘要
2. 对未勾选的维度，返回 null
3. 对信息严重不足的字段，填 null 或 "unknown"，并在 notes 中说明原因
4. 若没有足够信息，不要编造具体数字（金额、年份）
5. 所有金额单位请明确标注（如USD、CNY等）`;

  const selectedItemsStr = selectedItems.join(', ');

  const userPrompt = `这是已经抽取的企业基础信息 CompanyProfile：

"""
${JSON.stringify(companyProfile, null, 2)}
"""

这是 BP / 介绍文档的精简摘要内容：

"""
${documentSummary}
"""

用户选择的分析维度为：${selectedItemsStr}

请基于以上信息，输出一个完整的 AnalysisResult JSON，对未勾选的维度填 null。字段要求：

${selectedItems.includes('marketCap') ? `
1. marketCap（MarketCapAnalysis）：
   - industryDefinition: 行业定义说明
   - globalMarketCapRange: 全球或主要区域的总市值区间 { min, max, currency }
   - keyPublicCompanies: 关键上市公司举例 [{ name, ticker?, exchange?, country? }]
   - notes: 若无法给出准确数字，请在此说明
` : ''}

${selectedItems.includes('frontier') ? `
2. frontier（FrontierAnalysis）：
   - keyTrends: 近年该行业或技术方向的3-5个关键发展趋势
   - timeHorizon: 趋势的时间范围（如"2023-2025"）
   - notes: 补充说明
` : ''}

${selectedItems.includes('publicPeers') ? `
3. publicPeers（PublicPeersAnalysis）：
   - hasComparablePeers: 是否有合适可比公司
   - peers: 可比公司列表，每个包含：
     * name, ticker?, exchange?, country?
     * isComparable: 是否可比
     * reason: 可比性说明
     * last3YearsCoreMetrics: 最近3年核心数据 [{ year, revenue?, profit?, marketCap?, currency? }]
   - notes: 若无合适可比公司，说明原因
` : ''}

${selectedItems.includes('stage') ? `
4. stage（StageAnalysis）：
   - stage: 企业当前阶段（seed/preA/seriesA/seriesB/seriesC/preIPO/unknown）
   - reasoning: 判断依据
` : ''}

${selectedItems.includes('revenue') ? `
5. revenue（按年收入情况）：
   - 直接使用 companyProfile.revenueByYear，或补充更多信息
   - 若无数据，返回 null
` : ''}

${selectedItems.includes('profit') ? `
6. profit（ProfitAnalysis）：
   - currentStatus: profitable / lossMaking / breakeven / unknown
   - unitEconomics?: 单位经济说明
   - potentialPathToProfitability?: 潜在盈利路径
` : ''}

${selectedItems.includes('policyRisk') ? `
7. policyRisk（PolicyRiskAnalysis）：
   - riskLevel: low / medium / high / unknown
   - keyRisks: 关键政策风险点列表
   - jurisdictions: 涉及的主要国家/地区
` : ''}

${selectedItems.includes('investmentValue') ? `
8. investmentValue（InvestmentValueAnalysis）：
   - rating: high / medium / low
   - keyUpsides: 关键投资亮点
   - keyRisks: 关键风险点
   - targetInvestorProfile?: 目标投资人画像
` : ''}

${selectedItems.includes('financingCases') ? `
9. financingCases（FinancingCasesAnalysis）：
   - cases: 过去一年相似企业融资案例 [{ companyName, region?, round?, amount?, currency?, date?, leadInvestors? }]
   - notes: 补充说明或信息来源
` : ''}

${selectedItems.includes('papers') ? `
10. papers（PapersAnalysis，仅当 isHighTech 为 true 时）：
   - isHighTechIndustry: 是否属于高科技行业
   - papers: 过去2年相关科研文献5-10篇 [{ title, authors[], year, venue?, link?, summary, keyChallenges }]
   - notes: 补充说明
   - keyChallenges 中说明该方向目前最核心的科研难点
` : ''}

输出要求：
- 只输出一个 JSON 对象，符合 AnalysisResult 类型
- 不要输出任何额外文字或解释
- 对于未勾选的维度，直接设为 null`;

  return { systemPrompt, userPrompt };
}

/**
 * Staged Analysis Prompt - for multi-stage analysis
 */
export function getStagedAnalysisPrompt(
  stage: AnalysisStage,
  companyProfile: CompanyProfile,
  documentSummary: string
): {
  systemPrompt: string;
  userPrompt: string;
} {
  const stageConfig = ANALYSIS_STAGES.find(s => s.stage === stage);
  if (!stageConfig) {
    throw new Error(`Invalid stage: ${stage}`);
  }

  return getAnalysisPrompt(companyProfile, documentSummary, stageConfig.items);
}

/**
 * Chat prompt for follow-up questions
 */
export function getChatPrompt(
  companyProfile: CompanyProfile,
  analysisResult: any,
  documentText: string,
  chatHistory: Array<{ role: string; content: string }>,
  userQuestion: string
): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `你是一名专业的投研分析师助手。你已经分析了一份企业 BP，并与用户进行进一步的对话。

你可以访问：
1. 企业基础信息（CompanyProfile）
2. 完整的多维度分析结果（AnalysisResult）
3. 原始 BP 文档文本
4. 之前的对话历史

请基于这些信息回答用户的问题。回答要专业、准确、有洞察力。`;

  const historyStr = chatHistory
    .map(msg => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`)
    .join('\n\n');

  const userPrompt = `企业基础信息：
${JSON.stringify(companyProfile, null, 2)}

分析结果：
${JSON.stringify(analysisResult, null, 2)}

原始文档摘要：
${documentText.substring(0, 5000)}...

之前的对话：
${historyStr}

用户新问题：
${userQuestion}

请回答用户的问题：`;

  return { systemPrompt, userPrompt };
}

/**
 * Get analysis options with labels
 */
export function getAnalysisOptions() {
  return [
    { id: 'marketCap' as AnalysisItemId, label: '行业 Market Cap', description: '分析行业整体市值情况' },
    { id: 'frontier' as AnalysisItemId, label: '行业前沿发展', description: '分析行业最新趋势和前沿动态' },
    { id: 'publicPeers' as AnalysisItemId, label: '国际相似上市公司', description: '寻找可比上市公司及其核心数据' },
    { id: 'stage' as AnalysisItemId, label: '企业阶段判断', description: '判断企业当前融资阶段' },
    { id: 'revenue' as AnalysisItemId, label: '企业 Revenue 按年', description: '分析企业历史收入情况' },
    { id: 'profit' as AnalysisItemId, label: '盈利情况', description: '分析企业盈利现状和潜力' },
    { id: 'policyRisk' as AnalysisItemId, label: '政策风险', description: '评估企业面临的政策监管风险' },
    { id: 'investmentValue' as AnalysisItemId, label: '投资价值评级', description: '综合评估投资价值（高/中/低）' },
    { id: 'financingCases' as AnalysisItemId, label: '相似企业融资案例', description: '过去一年相似企业的融资情况' },
    { id: 'papers' as AnalysisItemId, label: '科研文献（高科技）', description: '高科技行业的相关科研文献和难点' }
  ];
}
