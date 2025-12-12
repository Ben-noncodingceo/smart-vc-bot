import { AnalysisResult } from '../types';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Export analysis result as JSON
 */
export function exportAsJSON(result: AnalysisResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Export analysis result as Markdown
 */
export function exportAsMarkdown(result: AnalysisResult): string {
  const { companyProfile } = result;

  let md = `# ${companyProfile.name} - 企业分析报告\n\n`;

  // Company Profile
  md += `## 企业概要\n\n`;
  md += `- **公司名称**: ${companyProfile.name}\n`;
  md += `- **所属行业**: ${companyProfile.industry}\n`;
  md += `- **所在国家/地区**: ${companyProfile.countryOrRegion}\n`;
  md += `- **企业阶段**: ${companyProfile.inferredStage || 'unknown'}\n`;
  md += `- **简介**: ${companyProfile.shortDescription}\n`;
  md += `- **是否高科技**: ${companyProfile.isHighTech ? '是' : '否'}\n\n`;

  // 1. Industry Background
  if (result.industryBackground) {
    md += `## 行业背景简述\n\n`;
    md += `**行业概况**: ${result.industryBackground.industryOverview}\n\n`;

    if (result.industryBackground.marketSize) {
      const ms = result.industryBackground.marketSize;
      md += `**市场规模** (${ms.year}年, ${ms.currency}):\n`;
      if (ms.global) md += `- 全球: ${ms.global} 百万\n`;
      if (ms.china) md += `- 中国: ${ms.china} 百万\n`;
      md += '\n';
    }

    if (result.industryBackground.keyPlayers && result.industryBackground.keyPlayers.length > 0) {
      md += `**主要参与者**: ${result.industryBackground.keyPlayers.join(', ')}\n\n`;
    }

    md += `**发展阶段**: ${result.industryBackground.developmentStage}\n\n`;

    if (result.industryBackground.notes) {
      md += `**备注**: ${result.industryBackground.notes}\n\n`;
    }
  }

  // 2. National Policy
  if (result.nationalPolicy) {
    md += `## 国家政策简述\n\n`;
    md += `**政策支持力度**: ${result.nationalPolicy.policySupport}\n\n`;

    if (result.nationalPolicy.relevantPolicies && result.nationalPolicy.relevantPolicies.length > 0) {
      md += `**相关政策**:\n\n`;
      result.nationalPolicy.relevantPolicies.forEach((policy, index) => {
        md += `${index + 1}. **${policy.policyName}**\n`;
        md += `   - 发布机构: ${policy.issuingAuthority}\n`;
        if (policy.effectiveDate) md += `   - 生效日期: ${policy.effectiveDate}\n`;
        md += `   - 摘要: ${policy.summary}\n\n`;
      });
    }

    if (result.nationalPolicy.regulatoryRisks && result.nationalPolicy.regulatoryRisks.length > 0) {
      md += `**监管风险**:\n`;
      result.nationalPolicy.regulatoryRisks.forEach((risk, index) => {
        md += `${index + 1}. ${risk}\n`;
      });
      md += '\n';
    }

    if (result.nationalPolicy.notes) {
      md += `**备注**: ${result.nationalPolicy.notes}\n\n`;
    }
  }

  // 3. Market Demand
  if (result.marketDemand) {
    md += `## 市场需求分析\n\n`;

    if (result.marketDemand.targetCustomers && result.marketDemand.targetCustomers.length > 0) {
      md += `**目标客户群体**: ${result.marketDemand.targetCustomers.join(', ')}\n\n`;
    }

    if (result.marketDemand.painPoints && result.marketDemand.painPoints.length > 0) {
      md += `**客户痛点**:\n`;
      result.marketDemand.painPoints.forEach((point, index) => {
        md += `${index + 1}. ${point}\n`;
      });
      md += '\n';
    }

    if (result.marketDemand.marketGrowthRate !== null && result.marketDemand.marketGrowthRate !== undefined) {
      md += `**市场增长率**: ${result.marketDemand.marketGrowthRate}%\n\n`;
    }

    if (result.marketDemand.demandDrivers && result.marketDemand.demandDrivers.length > 0) {
      md += `**需求驱动因素**:\n`;
      result.marketDemand.demandDrivers.forEach((driver, index) => {
        md += `${index + 1}. ${driver}\n`;
      });
      md += '\n';
    }

    md += `**竞争格局**: ${result.marketDemand.competitiveLandscape}\n\n`;

    if (result.marketDemand.notes) {
      md += `**备注**: ${result.marketDemand.notes}\n\n`;
    }
  }

  // 4. Technology Status
  if (result.technologyStatus) {
    md += `## 技术现状\n\n`;
    md += `**技术概况**: ${result.technologyStatus.technologyOverview}\n\n`;
    md += `**技术成熟度**: ${result.technologyStatus.technologyMaturity}\n\n`;

    if (result.technologyStatus.coreTechnologies && result.technologyStatus.coreTechnologies.length > 0) {
      md += `**核心技术**: ${result.technologyStatus.coreTechnologies.join(', ')}\n\n`;
    }

    if (result.technologyStatus.papers && result.technologyStatus.papers.length > 0) {
      md += `**前沿论文**:\n\n`;
      result.technologyStatus.papers.forEach((paper, index) => {
        md += `${index + 1}. **${paper.title}**\n`;
        const authors = Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors;
        md += `   - 作者: ${authors}\n`;
        md += `   - 年份: ${paper.year}\n`;
        if (paper.venue) md += `   - 发表于: ${paper.venue}\n`;
        if (paper.link) md += `   - 链接: ${paper.link}\n`;
        md += `   - 摘要: ${paper.summary}\n`;
        md += `   - 核心挑战: ${paper.keyChallenges}\n\n`;
      });
    }

    if (result.technologyStatus.technicalBarriers && result.technologyStatus.technicalBarriers.length > 0) {
      md += `**技术壁垒**:\n`;
      result.technologyStatus.technicalBarriers.forEach((barrier, index) => {
        md += `${index + 1}. ${barrier}\n`;
      });
      md += '\n';
    }

    if (result.technologyStatus.notes) {
      md += `**备注**: ${result.technologyStatus.notes}\n\n`;
    }
  }

  // 5. Application Trends
  if (result.applicationTrends) {
    md += `## 应用趋势\n\n`;
    md += `**应用普及率**: ${result.applicationTrends.adoptionRate}\n`;
    md += `**时间范围**: ${result.applicationTrends.timeHorizon}\n\n`;

    if (result.applicationTrends.currentApplications && result.applicationTrends.currentApplications.length > 0) {
      md += `**当前应用场景**:\n`;
      result.applicationTrends.currentApplications.forEach((app, index) => {
        md += `${index + 1}. ${app}\n`;
      });
      md += '\n';
    }

    if (result.applicationTrends.emergingApplications && result.applicationTrends.emergingApplications.length > 0) {
      md += `**新兴应用场景**:\n`;
      result.applicationTrends.emergingApplications.forEach((app, index) => {
        md += `${index + 1}. ${app}\n`;
      });
      md += '\n';
    }

    md += `**未来前景**: ${result.applicationTrends.futureProspects}\n\n`;

    if (result.applicationTrends.notes) {
      md += `**备注**: ${result.applicationTrends.notes}\n\n`;
    }
  }

  // 6. Business Model
  if (result.businessModel) {
    md += `## 商业模式\n\n`;
    md += `**价值主张**: ${result.businessModel.valueProposition}\n\n`;
    md += `**可扩展性**: ${result.businessModel.scalability}\n\n`;

    if (result.businessModel.revenueStreams && result.businessModel.revenueStreams.length > 0) {
      md += `**收入来源**:\n`;
      result.businessModel.revenueStreams.forEach((stream, index) => {
        md += `${index + 1}. ${stream}\n`;
      });
      md += '\n';
    }

    md += `**成本结构**: ${result.businessModel.costStructure}\n\n`;

    if (result.businessModel.customerChannels && result.businessModel.customerChannels.length > 0) {
      md += `**客户渠道**: ${result.businessModel.customerChannels.join(', ')}\n\n`;
    }

    if (result.businessModel.keyResources && result.businessModel.keyResources.length > 0) {
      md += `**关键资源**: ${result.businessModel.keyResources.join(', ')}\n\n`;
    }

    if (result.businessModel.keyActivities && result.businessModel.keyActivities.length > 0) {
      md += `**关键活动**: ${result.businessModel.keyActivities.join(', ')}\n\n`;
    }

    if (result.businessModel.notes) {
      md += `**备注**: ${result.businessModel.notes}\n\n`;
    }
  }

  // 7. Industry Ecosystem
  if (result.industryEcosystem) {
    md += `## 产业格局、上下游关系\n\n`;
    md += `**价值链定位**: ${result.industryEcosystem.valueChainPosition}\n\n`;

    if (result.industryEcosystem.upstreamSuppliers && result.industryEcosystem.upstreamSuppliers.length > 0) {
      md += `**上游供应商**:\n`;
      result.industryEcosystem.upstreamSuppliers.forEach(supplier => {
        md += `- **${supplier.category}** (议价能力: ${supplier.bargainingPower})\n`;
        md += `  关键参与者: ${supplier.keyPlayers.join(', ')}\n`;
      });
      md += '\n';
    }

    if (result.industryEcosystem.downstreamCustomers && result.industryEcosystem.downstreamCustomers.length > 0) {
      md += `**下游客户**:\n`;
      result.industryEcosystem.downstreamCustomers.forEach(customer => {
        md += `- **${customer.category}** (议价能力: ${customer.bargainingPower})\n`;
        md += `  关键参与者: ${customer.keyPlayers.join(', ')}\n`;
      });
      md += '\n';
    }

    if (result.industryEcosystem.competitors && result.industryEcosystem.competitors.length > 0) {
      md += `**主要竞争对手**:\n\n`;
      result.industryEcosystem.competitors.forEach((competitor, index) => {
        md += `${index + 1}. **${competitor.name}**\n`;
        if (competitor.marketShare) md += `   - 市场份额: ${competitor.marketShare}%\n`;
        if (competitor.strengths && competitor.strengths.length > 0) {
          md += `   - 优势: ${competitor.strengths.join(', ')}\n`;
        }
        if (competitor.weaknesses && competitor.weaknesses.length > 0) {
          md += `   - 劣势: ${competitor.weaknesses.join(', ')}\n`;
        }
        md += '\n';
      });
    }

    if (result.industryEcosystem.notes) {
      md += `**备注**: ${result.industryEcosystem.notes}\n\n`;
    }
  }

  // 8. Investment Opportunity
  if (result.investmentOpportunity) {
    md += `## 投资机会、投资价值\n\n`;
    md += `**投资评级**: ${result.investmentOpportunity.investmentRating}\n`;
    md += `**建议投资阶段**: ${result.investmentOpportunity.recommendedInvestmentStage}\n\n`;

    if (result.investmentOpportunity.targetReturn) {
      md += `**目标回报**: ${result.investmentOpportunity.targetReturn}\n`;
    }
    if (result.investmentOpportunity.timeframe) {
      md += `**投资周期**: ${result.investmentOpportunity.timeframe}\n\n`;
    }

    if (result.investmentOpportunity.valuationRange) {
      const vr = result.investmentOpportunity.valuationRange;
      md += `**估值区间**: ${vr.min || 'N/A'} - ${vr.max || 'N/A'} ${vr.currency} (百万)\n\n`;
    }

    if (result.investmentOpportunity.keyInvestmentHighlights && result.investmentOpportunity.keyInvestmentHighlights.length > 0) {
      md += `**关键投资亮点**:\n`;
      result.investmentOpportunity.keyInvestmentHighlights.forEach((highlight, index) => {
        md += `${index + 1}. ${highlight}\n`;
      });
      md += '\n';
    }

    if (result.investmentOpportunity.riskFactors && result.investmentOpportunity.riskFactors.length > 0) {
      md += `**风险因素**:\n`;
      result.investmentOpportunity.riskFactors.forEach((risk, index) => {
        md += `${index + 1}. ${risk}\n`;
      });
      md += '\n';
    }

    if (result.investmentOpportunity.exitStrategy && result.investmentOpportunity.exitStrategy.length > 0) {
      md += `**退出策略**: ${result.investmentOpportunity.exitStrategy.join(', ')}\n\n`;
    }

    if (result.investmentOpportunity.notes) {
      md += `**备注**: ${result.investmentOpportunity.notes}\n\n`;
    }
  }

  md += `\n---\n\n*报告生成时间: ${new Date().toLocaleString('zh-CN')}*\n`;

  return md;
}

/**
 * Download content as file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy content to clipboard
 */
export async function copyToClipboard(content: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(content);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

/**
 * Export analysis result as PDF using html2pdf
 */
export async function exportAsPDF(result: AnalysisResult, filename: string): Promise<void> {
  // Convert to HTML from markdown
  const markdown = exportAsMarkdown(result);

  // Create a temporary HTML container
  const htmlContent = markdown
    .replace(/\n/g, '<br>')
    .replace(/## (.*?)<br>/g, '<h2>$1</h2>')
    .replace(/### (.*?)<br>/g, '<h3>$1</h3>')
    .replace(/# (.*?)<br>/g, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  element.style.padding = '20px';
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.fontSize = '12px';
  element.style.lineHeight = '1.6';

  const options = {
    margin: 10,
    filename: filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
  };

  await html2pdf().set(options).from(element).save();
}

/**
 * Export analysis result as DOCX with complete content
 */
export async function exportAsDOCX(result: AnalysisResult, filename: string): Promise<void> {
  const { companyProfile } = result;
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: `${companyProfile.name} - 企业分析报告`,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    })
  );
  children.push(new Paragraph({ text: '' }));

  // ========== 企业概要 ==========
  children.push(new Paragraph({ text: '企业概要', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph({
    children: [
      new TextRun({ text: '公司名称: ', bold: true }),
      new TextRun(companyProfile.name),
    ],
  }));
  children.push(new Paragraph({
    children: [
      new TextRun({ text: '所属行业: ', bold: true }),
      new TextRun(companyProfile.industry),
    ],
  }));
  children.push(new Paragraph({
    children: [
      new TextRun({ text: '所在国家/地区: ', bold: true }),
      new TextRun(companyProfile.countryOrRegion),
    ],
  }));
  children.push(new Paragraph({
    children: [
      new TextRun({ text: '企业阶段: ', bold: true }),
      new TextRun(companyProfile.inferredStage || 'unknown'),
    ],
  }));
  children.push(new Paragraph({
    children: [
      new TextRun({ text: '简介: ', bold: true }),
      new TextRun(companyProfile.shortDescription),
    ],
  }));
  children.push(new Paragraph({
    children: [
      new TextRun({ text: '是否高科技: ', bold: true }),
      new TextRun(companyProfile.isHighTech ? '是' : '否'),
    ],
  }));
  children.push(new Paragraph({ text: '' }));

  // ========== 1. Industry Background ==========
  if (result.industryBackground) {
    children.push(new Paragraph({ text: '行业背景简述', heading: HeadingLevel.HEADING_1 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '行业概况: ', bold: true }),
        new TextRun(result.industryBackground.industryOverview),
      ],
    }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '发展阶段: ', bold: true }),
        new TextRun(result.industryBackground.developmentStage),
      ],
    }));
    children.push(new Paragraph({ text: '' }));
  }

  // ========== 2. National Policy ==========
  if (result.nationalPolicy) {
    children.push(new Paragraph({ text: '国家政策简述', heading: HeadingLevel.HEADING_1 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '政策支持力度: ', bold: true }),
        new TextRun(result.nationalPolicy.policySupport),
      ],
    }));
    if (result.nationalPolicy.relevantPolicies && result.nationalPolicy.relevantPolicies.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: '相关政策:', bold: true })],
      }));
      result.nationalPolicy.relevantPolicies.forEach(policy => {
        children.push(new Paragraph({
          text: `${policy.policyName} (${policy.issuingAuthority})`,
          bullet: { level: 0 },
        }));
      });
    }
    children.push(new Paragraph({ text: '' }));
  }

  // ========== 3. Market Demand ==========
  if (result.marketDemand) {
    children.push(new Paragraph({ text: '市场需求分析', heading: HeadingLevel.HEADING_1 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '竞争格局: ', bold: true }),
        new TextRun(result.marketDemand.competitiveLandscape),
      ],
    }));
    if (result.marketDemand.marketGrowthRate) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: '市场增长率: ', bold: true }),
          new TextRun(`${result.marketDemand.marketGrowthRate}%`),
        ],
      }));
    }
    children.push(new Paragraph({ text: '' }));
  }

  // ========== 4. Technology Status ==========
  if (result.technologyStatus) {
    children.push(new Paragraph({ text: '技术现状', heading: HeadingLevel.HEADING_1 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '技术概况: ', bold: true }),
        new TextRun(result.technologyStatus.technologyOverview),
      ],
    }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '技术成熟度: ', bold: true }),
        new TextRun(result.technologyStatus.technologyMaturity),
      ],
    }));

    if (result.technologyStatus.papers && result.technologyStatus.papers.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: '前沿论文:', bold: true })],
      }));
      result.technologyStatus.papers.forEach((paper, index) => {
        children.push(new Paragraph({
          text: `${index + 1}. ${paper.title} (${paper.year})`,
          bullet: { level: 0 },
        }));
      });
    }
    children.push(new Paragraph({ text: '' }));
  }

  // ========== 5. Application Trends ==========
  if (result.applicationTrends) {
    children.push(new Paragraph({ text: '应用趋势', heading: HeadingLevel.HEADING_1 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '未来前景: ', bold: true }),
        new TextRun(result.applicationTrends.futureProspects),
      ],
    }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '时间范围: ', bold: true }),
        new TextRun(result.applicationTrends.timeHorizon),
      ],
    }));
    children.push(new Paragraph({ text: '' }));
  }

  // ========== 6. Business Model ==========
  if (result.businessModel) {
    children.push(new Paragraph({ text: '商业模式', heading: HeadingLevel.HEADING_1 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '价值主张: ', bold: true }),
        new TextRun(result.businessModel.valueProposition),
      ],
    }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '可扩展性: ', bold: true }),
        new TextRun(result.businessModel.scalability),
      ],
    }));
    children.push(new Paragraph({ text: '' }));
  }

  // ========== 7. Industry Ecosystem ==========
  if (result.industryEcosystem) {
    children.push(new Paragraph({ text: '产业格局、上下游关系', heading: HeadingLevel.HEADING_1 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '价值链定位: ', bold: true }),
        new TextRun(result.industryEcosystem.valueChainPosition),
      ],
    }));
    if (result.industryEcosystem.competitors && result.industryEcosystem.competitors.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: '主要竞争对手:', bold: true })],
      }));
      result.industryEcosystem.competitors.forEach(competitor => {
        children.push(new Paragraph({
          text: competitor.name,
          bullet: { level: 0 },
        }));
      });
    }
    children.push(new Paragraph({ text: '' }));
  }

  // ========== 8. Investment Opportunity ==========
  if (result.investmentOpportunity) {
    children.push(new Paragraph({ text: '投资机会、投资价值', heading: HeadingLevel.HEADING_1 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '投资评级: ', bold: true }),
        new TextRun(result.investmentOpportunity.investmentRating.toUpperCase()),
      ],
    }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '建议投资阶段: ', bold: true }),
        new TextRun(result.investmentOpportunity.recommendedInvestmentStage),
      ],
    }));

    if (result.investmentOpportunity.keyInvestmentHighlights && result.investmentOpportunity.keyInvestmentHighlights.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: '关键投资亮点:', bold: true })],
      }));
      result.investmentOpportunity.keyInvestmentHighlights.forEach((highlight, index) => {
        children.push(new Paragraph({
          text: `${index + 1}. ${highlight}`,
          bullet: { level: 0 },
        }));
      });
    }

    if (result.investmentOpportunity.riskFactors && result.investmentOpportunity.riskFactors.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: '风险因素:', bold: true })],
      }));
      result.investmentOpportunity.riskFactors.forEach((risk, index) => {
        children.push(new Paragraph({
          text: `${index + 1}. ${risk}`,
          bullet: { level: 0 },
        }));
      });
    }

    children.push(new Paragraph({ text: '' }));
  }

  // Footer
  children.push(new Paragraph({
    text: `报告生成时间: ${new Date().toLocaleString('zh-CN')}`,
    alignment: AlignmentType.CENTER,
  }));

  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
