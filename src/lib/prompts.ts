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
 * Step 2: Multi-dimensional Analysis with Internet Search Integration
 */
export function getAnalysisPrompt(
  companyProfile: CompanyProfile,
  documentSummary: string,
  selectedItems: AnalysisItemId[]
): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `你是一名专业的 TMT / 高科技方向投研分析师。你会基于企业的 BP 文档内容、你自己的知识库和网络上的最新信息，对该企业及其所在行业进行多维度深度分析。

**重要要求**：
1. 充分利用给定的 CompanyProfile 和文档摘要
2. **主动搜索和引用网络上的最新行业信息、政策文件、市场报告、学术论文等**
3. **提供具体的数据、案例和参考来源**
4. 对未勾选的维度，返回 null
5. 对信息严重不足的字段，填 null 或 "unknown"，并在 notes 中说明原因
6. 若没有足够信息，不要编造具体数字（金额、年份）
7. 所有金额单位请明确标注（如USD、CNY等）
8. 所有输出必须使用 JSON，严格匹配给定的 TypeScript 类型 AnalysisResult

**网络信息搜索要求**：
- 对于行业背景、国家政策、市场需求、技术现状等维度，请基于你的知识库和最新网络信息进行分析
- 引用具体的政策文件名称、发布机构和时间
- 引用具体的市场研究报告、数据来源
- 引用具体的前沿论文标题、作者、发表年份
- 提供可验证的数据和信息`;

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

**请基于以上信息、你的知识库以及网络上的最新信息，输出一个完整的 AnalysisResult JSON**，对未勾选的维度填 null。

各维度要求：

${selectedItems.includes('industryBackground') ? `
### 1. industryBackground（行业背景简述）- IndustryBackgroundAnalysis

请提供：
- industryOverview: 行业概况描述（包括行业定义、发展历史、当前状态）
- marketSize: 市场规模
  * global: 全球市场规模（百万为单位）
  * china: 中国市场规模（百万为单位）
  * currency: 币种（USD 或 CNY）
  * year: 数据年份
- keyPlayers: 主要参与者列表（列出3-5家关键企业）
- developmentStage: 发展阶段描述（如"初创期"、"成长期"、"成熟期"等）
- notes: 补充说明或数据来源

**网络搜索要求**：请搜索最新的行业研究报告、市场规模数据，并注明来源。
` : ''}

${selectedItems.includes('nationalPolicy') ? `
### 2. nationalPolicy（国家政策简述）- NationalPolicyAnalysis

请提供：
- relevantPolicies: 相关政策列表，每项包含：
  * policyName: 政策名称（具体完整的政策文件名称）
  * issuingAuthority: 发布机构（如"国务院"、"工信部"等）
  * effectiveDate: 生效日期（格式：YYYY-MM-DD 或 YYYY-MM）
  * summary: 政策摘要（简要说明政策内容和对行业的影响）
- policySupport: 政策支持力度（strong / moderate / weak / unknown）
- regulatoryRisks: 监管风险列表（列出可能的监管风险点）
- notes: 补充说明

**网络搜索要求**：请搜索最新的国家政策文件、行业监管政策，提供具体的政策名称和发布时间。
` : ''}

${selectedItems.includes('marketDemand') ? `
### 3. marketDemand（市场需求分析）- MarketDemandAnalysis

请提供：
- targetCustomers: 目标客户群体列表（列出3-5个主要客户群体）
- painPoints: 客户痛点列表（列出3-5个关键痛点）
- marketGrowthRate: 市场增长率（百分比，如 15.5 表示 15.5%）
- demandDrivers: 需求驱动因素列表（列出3-5个主要驱动因素）
- competitiveLandscape: 竞争格局描述（描述市场竞争状况）
- notes: 补充说明

**网络搜索要求**：请搜索最新的市场研究报告、行业分析，提供具体的市场增长率数据和来源。
` : ''}

${selectedItems.includes('technologyStatus') ? `
### 4. technologyStatus（技术现状 - 前沿论文）- TechnologyStatusAnalysis

请提供：
- technologyOverview: 技术概况（描述该领域的技术现状）
- coreTechnologies: 核心技术列表（列出3-5项核心技术）
- technologyMaturity: 技术成熟度（early / growing / mature / declining）
- papers: 前沿论文列表（**必须提供5篇**），每篇包含：
  * title: 论文标题（完整的英文或中文标题）
  * authors: 作者列表（列出主要作者）
  * year: 发表年份（2022-2024年的最新论文）
  * venue: 发表会议/期刊（如 "NeurIPS 2023", "Nature"等）
  * link: 论文链接（如有）
  * summary: 论文摘要（简要说明论文的主要贡献）
  * keyChallenges: 核心挑战（说明该领域当前面临的核心科研难点）
- technicalBarriers: 技术壁垒列表（列出3-5项技术壁垒）
- notes: 补充说明

**网络搜索要求**：请搜索最新的学术论文（2022-2024年），提供具体的论文标题、作者、发表会议/期刊。
**重要**：必须提供5篇高质量的前沿论文，不可少于5篇。
` : ''}

${selectedItems.includes('applicationTrends') ? `
### 5. applicationTrends（应用趋势）- ApplicationTrendsAnalysis

请提供：
- currentApplications: 当前应用场景列表（列出3-5个主要应用场景）
- emergingApplications: 新兴应用场景列表（列出3-5个新兴应用场景）
- adoptionRate: 应用普及率（high / medium / low / unknown）
- futureProspects: 未来前景描述（描述未来3-5年的应用前景）
- timeHorizon: 时间范围（如"2024-2028"）
- notes: 补充说明

**网络搜索要求**：请搜索最新的应用案例、行业报告，提供具体的应用场景和趋势预测。
` : ''}

${selectedItems.includes('businessModel') ? `
### 6. businessModel（商业模式）- BusinessModelAnalysis

请提供：
- revenueStreams: 收入来源列表（列出3-5个主要收入来源）
- costStructure: 成本结构描述（描述主要成本构成）
- valueProposition: 价值主张（简明描述企业为客户创造的核心价值）
- customerChannels: 客户渠道列表（列出3-5个主要客户渠道）
- keyResources: 关键资源列表（列出3-5项关键资源）
- keyActivities: 关键活动列表（列出3-5项关键业务活动）
- scalability: 可扩展性（high / medium / low）
- notes: 补充说明

**网络搜索要求**：请参考同行业成功企业的商业模式，提供可借鉴的案例。
` : ''}

${selectedItems.includes('industryEcosystem') ? `
### 7. industryEcosystem（产业格局、上下游关系）- IndustryEcosystemAnalysis

请提供：
- upstreamSuppliers: 上游供应商列表，每项包含：
  * category: 供应商类别（如"芯片供应商"、"原材料供应商"等）
  * keyPlayers: 关键参与者列表（列出2-3家代表企业）
  * bargainingPower: 议价能力（strong / moderate / weak）
- downstreamCustomers: 下游客户列表，每项包含：
  * category: 客户类别（如"终端用户"、"系统集成商"等）
  * keyPlayers: 关键参与者列表（列出2-3家代表企业）
  * bargainingPower: 议价能力（strong / moderate / weak）
- competitors: 主要竞争对手列表（列出3-5家），每家包含：
  * name: 竞争对手名称
  * marketShare: 市场份额（百分比，如 25.5 表示 25.5%）
  * strengths: 优势列表（列出2-3项优势）
  * weaknesses: 劣势列表（列出2-3项劣势）
- valueChainPosition: 价值链定位（描述企业在产业链中的位置）
- notes: 补充说明

**网络搜索要求**：请搜索产业链分析报告、竞争对手信息，提供具体的企业名称和市场份额数据。
` : ''}

${selectedItems.includes('investmentOpportunity') ? `
### 8. investmentOpportunity（投资机会、投资价值）- InvestmentOpportunityAnalysis

请提供：
- investmentRating: 投资评级（high / medium / low）
- keyInvestmentHighlights: 关键投资亮点列表（列出3-5个核心亮点）
- riskFactors: 风险因素列表（列出3-5个主要风险）
- valuationRange: 估值区间（可选）
  * min: 最低估值（百万为单位）
  * max: 最高估值（百万为单位）
  * currency: 币种（USD 或 CNY）
- exitStrategy: 退出策略列表（如"IPO上市"、"并购退出"等）
- recommendedInvestmentStage: 建议投资阶段（如"A轮"、"B轮"等）
- targetReturn: 目标回报（如"3-5倍"、"年化20%"等）
- timeframe: 投资周期（如"3-5年"）
- notes: 补充说明

**网络搜索要求**：请参考同行业融资案例、估值数据，提供可比公司的估值倍数。
` : ''}

输出要求：
- 只输出一个 JSON 对象，符合 AnalysisResult 类型
- 不要输出任何额外文字或解释
- 对于未勾选的维度，直接设为 null
- **所有信息必须基于事实和可验证的数据，不要编造信息**
- **在 notes 字段中注明主要信息来源**`;

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
1. 企业基础信息 (CompanyProfile)
2. 完整的多维度分析结果 (AnalysisResult)
3. 原始BP文档内容
4. 之前的对话历史

请基于这些信息回答用户的问题。回答要求：
- 专业、准确、有见地
- 引用分析结果中的具体数据和结论
- 如果问题涉及分析结果中没有的信息，可以基于你的知识库和网络信息补充
- 如果需要，可以用表格、列表等格式组织信息
- 支持 Markdown 格式输出`;

  const userPrompt = `企业信息：
${JSON.stringify(companyProfile, null, 2)}

分析结果：
${JSON.stringify(analysisResult, null, 2)}

文档摘要：
${documentText.substring(0, 3000)}...

对话历史：
${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

用户问题：${userQuestion}

请回答用户的问题：`;

  return { systemPrompt, userPrompt };
}
