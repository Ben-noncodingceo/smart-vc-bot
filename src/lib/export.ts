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

  // Market Cap
  if (result.marketCap) {
    md += `## 行业 Market Cap\n\n`;
    md += `**行业定义**: ${result.marketCap.industryDefinition}\n\n`;

    if (result.marketCap.globalMarketCapRange) {
      const range = result.marketCap.globalMarketCapRange;
      md += `**市值区间**: ${range.min || 'N/A'} - ${range.max || 'N/A'} ${range.currency}\n\n`;
    }

    if (result.marketCap.keyPublicCompanies && result.marketCap.keyPublicCompanies.length > 0) {
      md += `**关键上市公司**:\n`;
      result.marketCap.keyPublicCompanies.forEach(company => {
        md += `- ${company.name} (${company.ticker || 'N/A'}, ${company.exchange || 'N/A'}, ${company.country || 'N/A'})\n`;
      });
      md += '\n';
    }

    if (result.marketCap.notes) {
      md += `**备注**: ${result.marketCap.notes}\n\n`;
    }
  }

  // Frontier
  if (result.frontier) {
    md += `## 行业前沿发展\n\n`;
    md += `**时间范围**: ${result.frontier.timeHorizon}\n\n`;
    md += `**关键趋势**:\n`;
    result.frontier.keyTrends.forEach((trend, index) => {
      md += `${index + 1}. ${trend}\n`;
    });
    md += '\n';

    if (result.frontier.notes) {
      md += `**备注**: ${result.frontier.notes}\n\n`;
    }
  }

  // Public Peers
  if (result.publicPeers) {
    md += `## 国际相似上市公司\n\n`;
    md += `**是否有可比公司**: ${result.publicPeers.hasComparablePeers ? '是' : '否'}\n\n`;

    if (result.publicPeers.peers && result.publicPeers.peers.length > 0) {
      result.publicPeers.peers.forEach(peer => {
        md += `### ${peer.name}\n\n`;
        md += `- **股票代码**: ${peer.ticker || 'N/A'}\n`;
        md += `- **交易所**: ${peer.exchange || 'N/A'}\n`;
        md += `- **国家**: ${peer.country || 'N/A'}\n`;
        md += `- **是否可比**: ${peer.isComparable ? '是' : '否'}\n`;

        if (peer.reason) {
          md += `- **可比性说明**: ${peer.reason}\n`;
        }

        if (peer.last3YearsCoreMetrics && peer.last3YearsCoreMetrics.length > 0) {
          md += `\n**近3年核心数据**:\n\n`;
          md += `| 年份 | 收入 | 利润 | 市值 |\n`;
          md += `|------|------|------|------|\n`;
          peer.last3YearsCoreMetrics.forEach(metric => {
            const revenue = metric.revenue !== null ? `${metric.revenue} ${metric.currency || ''}` : 'N/A';
            const profit = metric.profit !== null ? `${metric.profit} ${metric.currency || ''}` : 'N/A';
            const marketCap = metric.marketCap !== null ? `${metric.marketCap} ${metric.currency || ''}` : 'N/A';
            md += `| ${metric.year} | ${revenue} | ${profit} | ${marketCap} |\n`;
          });
        }
        md += '\n';
      });
    }

    if (result.publicPeers.notes) {
      md += `**备注**: ${result.publicPeers.notes}\n\n`;
    }
  }

  // Stage
  if (result.stage) {
    md += `## 企业阶段判断\n\n`;
    md += `**阶段**: ${result.stage.stage}\n\n`;
    md += `**判断依据**: ${result.stage.reasoning}\n\n`;
  }

  // Revenue
  if (result.revenue && result.revenue.length > 0) {
    md += `## 企业 Revenue 按年\n\n`;
    md += `| 年份 | 金额 | 货币 | 备注 |\n`;
    md += `|------|------|------|------|\n`;
    result.revenue.forEach(rev => {
      const amount = rev.amount !== null ? rev.amount : 'N/A';
      md += `| ${rev.year} | ${amount} | ${rev.currency || 'N/A'} | ${rev.note || '-'} |\n`;
    });
    md += '\n';
  }

  // Profit
  if (result.profit) {
    md += `## 盈利情况\n\n`;
    md += `**当前状态**: ${result.profit.currentStatus}\n\n`;

    if (result.profit.unitEconomics) {
      md += `**单位经济**: ${result.profit.unitEconomics}\n\n`;
    }

    if (result.profit.potentialPathToProfitability) {
      md += `**潜在盈利路径**: ${result.profit.potentialPathToProfitability}\n\n`;
    }
  }

  // Policy Risk
  if (result.policyRisk) {
    md += `## 政策风险\n\n`;
    md += `**风险等级**: ${result.policyRisk.riskLevel}\n\n`;

    if (result.policyRisk.keyRisks && result.policyRisk.keyRisks.length > 0) {
      md += `**关键风险点**:\n`;
      result.policyRisk.keyRisks.forEach((risk, index) => {
        md += `${index + 1}. ${risk}\n`;
      });
      md += '\n';
    }

    if (result.policyRisk.jurisdictions && result.policyRisk.jurisdictions.length > 0) {
      md += `**涉及地区**: ${result.policyRisk.jurisdictions.join(', ')}\n\n`;
    }
  }

  // Investment Value
  if (result.investmentValue) {
    md += `## 投资价值评级\n\n`;
    md += `**评级**: ${result.investmentValue.rating}\n\n`;

    if (result.investmentValue.keyUpsides && result.investmentValue.keyUpsides.length > 0) {
      md += `**关键投资亮点**:\n`;
      result.investmentValue.keyUpsides.forEach((upside, index) => {
        md += `${index + 1}. ${upside}\n`;
      });
      md += '\n';
    }

    if (result.investmentValue.keyRisks && result.investmentValue.keyRisks.length > 0) {
      md += `**关键风险点**:\n`;
      result.investmentValue.keyRisks.forEach((risk, index) => {
        md += `${index + 1}. ${risk}\n`;
      });
      md += '\n';
    }

    if (result.investmentValue.targetInvestorProfile) {
      md += `**目标投资人画像**: ${result.investmentValue.targetInvestorProfile}\n\n`;
    }
  }

  // Financing Cases
  if (result.financingCases && result.financingCases.cases.length > 0) {
    md += `## 相似企业融资案例\n\n`;
    md += `| 公司名称 | 地区 | 轮次 | 金额 | 日期 | 主导机构 |\n`;
    md += `|----------|------|------|------|------|----------|\n`;
    result.financingCases.cases.forEach(fc => {
      const amount = fc.amount !== null ? `${fc.amount} ${fc.currency || ''}` : 'N/A';
      const investors = Array.isArray(fc.leadInvestors) ? fc.leadInvestors.join(', ') : 'N/A';
      md += `| ${fc.companyName} | ${fc.region || 'N/A'} | ${fc.round || 'N/A'} | ${amount} | ${fc.date || 'N/A'} | ${investors} |\n`;
    });
    md += '\n';

    if (result.financingCases.notes) {
      md += `**备注**: ${result.financingCases.notes}\n\n`;
    }
  }

  // Papers
  if (result.papers && result.papers.isHighTechIndustry && result.papers.papers.length > 0) {
    md += `## 科研文献\n\n`;
    result.papers.papers.forEach((paper, index) => {
      md += `### ${index + 1}. ${paper.title}\n\n`;
      const authors = Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors;
      md += `- **作者**: ${authors}\n`;
      md += `- **年份**: ${paper.year}\n`;
      if (paper.venue) {
        md += `- **发表于**: ${paper.venue}\n`;
      }
      if (paper.link) {
        md += `- **链接**: ${paper.link}\n`;
      }
      md += `- **摘要**: ${paper.summary}\n`;
      md += `- **核心挑战**: ${paper.keyChallenges}\n\n`;
    });

    if (result.papers.notes) {
      md += `**备注**: ${result.papers.notes}\n\n`;
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

  // ========== 阶段 1: 技术、行业前沿 ==========
  children.push(new Paragraph({ text: '阶段 1: 技术、行业前沿', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph({ text: '' }));

  // Papers
  if (result.papers && result.papers.papers.length > 0) {
    children.push(new Paragraph({ text: '核心论文', heading: HeadingLevel.HEADING_2 }));
    result.papers.papers.forEach((paper, index) => {
      children.push(new Paragraph({
        text: `${index + 1}. ${paper.title}`,
        bullet: { level: 0 },
      }));
      const authors = Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors;
      children.push(new Paragraph({
        text: `作者: ${authors} | 年份: ${paper.year}`,
        indent: { left: 720 },
      }));
      children.push(new Paragraph({
        text: `摘要: ${paper.summary}`,
        indent: { left: 720 },
      }));
    });
    children.push(new Paragraph({ text: '' }));
  }

  // Frontier
  if (result.frontier) {
    children.push(new Paragraph({ text: '行业前沿发展', heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '时间范围: ', bold: true }),
        new TextRun(result.frontier.timeHorizon),
      ],
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: '关键趋势:', bold: true })],
    }));
    result.frontier.keyTrends.forEach((trend, index) => {
      children.push(new Paragraph({
        text: `${index + 1}. ${trend}`,
        bullet: { level: 0 },
      }));
    });
    children.push(new Paragraph({ text: '' }));
  }

  // Public Peers
  if (result.publicPeers && result.publicPeers.peers.length > 0) {
    children.push(new Paragraph({ text: '国际相似上市公司', heading: HeadingLevel.HEADING_2 }));
    result.publicPeers.peers.forEach(peer => {
      children.push(new Paragraph({
        text: `${peer.name}`,
        bullet: { level: 0 },
      }));
      children.push(new Paragraph({
        text: `股票代码: ${peer.ticker || 'N/A'} | 交易所: ${peer.exchange || 'N/A'}`,
        indent: { left: 720 },
      }));
      if (peer.reason) {
        children.push(new Paragraph({
          text: `可比性说明: ${peer.reason}`,
          indent: { left: 720 },
        }));
      }
    });
    children.push(new Paragraph({ text: '' }));
  }

  // ========== 阶段 2: 商业数据商业价值 ==========
  children.push(new Paragraph({ text: '阶段 2: 商业数据商业价值', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph({ text: '' }));

  // Market Cap
  if (result.marketCap) {
    children.push(new Paragraph({ text: '行业 Market Cap', heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '行业定义: ', bold: true }),
        new TextRun(result.marketCap.industryDefinition),
      ],
    }));
    if (result.marketCap.globalMarketCapRange) {
      const range = result.marketCap.globalMarketCapRange;
      children.push(new Paragraph({
        children: [
          new TextRun({ text: '市值区间: ', bold: true }),
          new TextRun(`${range.min || 'N/A'} - ${range.max || 'N/A'} ${range.currency}`),
        ],
      }));
    }
    children.push(new Paragraph({ text: '' }));
  }

  // Revenue
  if (result.revenue && result.revenue.length > 0) {
    children.push(new Paragraph({ text: '企业 Revenue 按年', heading: HeadingLevel.HEADING_2 }));
    result.revenue.forEach(rev => {
      const amount = rev.amount !== null ? rev.amount : 'N/A';
      children.push(new Paragraph({
        text: `${rev.year}年: ${amount} ${rev.currency || ''}`,
        bullet: { level: 0 },
      }));
    });
    children.push(new Paragraph({ text: '' }));
  }

  // Profit
  if (result.profit) {
    children.push(new Paragraph({ text: '盈利情况', heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '当前状态: ', bold: true }),
        new TextRun(result.profit.currentStatus),
      ],
    }));
    if (result.profit.unitEconomics) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: '单位经济: ', bold: true }),
          new TextRun(result.profit.unitEconomics),
        ],
      }));
    }
    children.push(new Paragraph({ text: '' }));
  }

  // Financing Cases
  if (result.financingCases && result.financingCases.cases.length > 0) {
    children.push(new Paragraph({ text: '相似企业融资案例', heading: HeadingLevel.HEADING_2 }));
    result.financingCases.cases.forEach(fc => {
      const amount = fc.amount !== null ? `${fc.amount} ${fc.currency || ''}` : 'N/A';
      children.push(new Paragraph({
        text: `${fc.companyName}: ${fc.round || 'N/A'} | ${amount}`,
        bullet: { level: 0 },
      }));
    });
    children.push(new Paragraph({ text: '' }));
  }

  // Policy Risk
  if (result.policyRisk) {
    children.push(new Paragraph({ text: '政策风险', heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '风险等级: ', bold: true }),
        new TextRun(result.policyRisk.riskLevel.toUpperCase()),
      ],
    }));
    if (result.policyRisk.keyRisks && result.policyRisk.keyRisks.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: '关键风险点:', bold: true })],
      }));
      result.policyRisk.keyRisks.forEach((risk, index) => {
        children.push(new Paragraph({
          text: `${index + 1}. ${risk}`,
          bullet: { level: 0 },
        }));
      });
    }
    children.push(new Paragraph({ text: '' }));
  }

  // ========== 阶段 3: 团队、执行 ==========
  children.push(new Paragraph({ text: '阶段 3: 团队、执行', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph({ text: '' }));

  // Stage
  if (result.stage) {
    children.push(new Paragraph({ text: '企业阶段判断', heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '阶段: ', bold: true }),
        new TextRun(result.stage.stage || 'unknown'),
      ],
    }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '判断依据: ', bold: true }),
        new TextRun(result.stage.reasoning),
      ],
    }));
    children.push(new Paragraph({ text: '' }));
  }

  // ========== 阶段 4: 综合评价投资价值 ==========
  children.push(new Paragraph({ text: '阶段 4: 综合评价投资价值', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph({ text: '' }));

  // Investment Value
  if (result.investmentValue) {
    children.push(new Paragraph({ text: '投资价值评级', heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '评级: ', bold: true }),
        new TextRun(result.investmentValue.rating.toUpperCase()),
      ],
    }));

    if (result.investmentValue.keyUpsides && result.investmentValue.keyUpsides.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: '关键投资亮点:', bold: true })],
      }));
      result.investmentValue.keyUpsides.forEach((upside, index) => {
        children.push(new Paragraph({
          text: `${index + 1}. ${upside}`,
          bullet: { level: 0 },
        }));
      });
    }

    if (result.investmentValue.keyRisks && result.investmentValue.keyRisks.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: '关键风险点:', bold: true })],
      }));
      result.investmentValue.keyRisks.forEach((risk, index) => {
        children.push(new Paragraph({
          text: `${index + 1}. ${risk}`,
          bullet: { level: 0 },
        }));
      });
    }

    if (result.investmentValue.targetInvestorProfile) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: '目标投资人画像: ', bold: true }),
          new TextRun(result.investmentValue.targetInvestorProfile),
        ],
      }));
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
