import { AnalysisResult } from '../types';
import jsPDF from 'jspdf';
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
      const investors = fc.leadInvestors ? fc.leadInvestors.join(', ') : 'N/A';
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
      md += `- **作者**: ${paper.authors.join(', ')}\n`;
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
 * Export analysis result as PDF
 * Note: Using markdown as intermediate format for simplicity
 */
export async function exportAsPDF(result: AnalysisResult, filename: string): Promise<void> {
  // Convert to markdown first
  const markdown = exportAsMarkdown(result);

  // Create PDF using jsPDF
  const doc = new jsPDF();

  // Split text into lines that fit the page width
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxLineWidth = pageWidth - (margin * 2);

  const lines = doc.splitTextToSize(markdown, maxLineWidth);

  let y = margin;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.getHeight();

  lines.forEach((line: string) => {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });

  doc.save(filename);
}

/**
 * Export analysis result as DOCX
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

  // Company Profile Section
  children.push(
    new Paragraph({
      text: '企业概要',
      heading: HeadingLevel.HEADING_1,
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '公司名称: ', bold: true }),
        new TextRun(companyProfile.name),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '所属行业: ', bold: true }),
        new TextRun(companyProfile.industry),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '所在国家/地区: ', bold: true }),
        new TextRun(companyProfile.countryOrRegion),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '企业阶段: ', bold: true }),
        new TextRun(companyProfile.inferredStage || 'unknown'),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '简介: ', bold: true }),
        new TextRun(companyProfile.shortDescription),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '是否高科技: ', bold: true }),
        new TextRun(companyProfile.isHighTech ? '是' : '否'),
      ],
    })
  );

  children.push(new Paragraph({ text: '' }));

  // Add other sections based on available data
  if (result.investmentValue) {
    children.push(
      new Paragraph({
        text: '投资价值评级',
        heading: HeadingLevel.HEADING_1,
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: '评级: ', bold: true }),
          new TextRun(result.investmentValue.rating.toUpperCase()),
        ],
      })
    );

    if (result.investmentValue.keyUpsides && result.investmentValue.keyUpsides.length > 0) {
      children.push(
        new Paragraph({
          text: '关键投资亮点:',
          heading: HeadingLevel.HEADING_2,
        })
      );

      result.investmentValue.keyUpsides.forEach((upside, index) => {
        children.push(
          new Paragraph({
            text: `${index + 1}. ${upside}`,
            bullet: { level: 0 },
          })
        );
      });
    }

    if (result.investmentValue.keyRisks && result.investmentValue.keyRisks.length > 0) {
      children.push(
        new Paragraph({
          text: '关键风险点:',
          heading: HeadingLevel.HEADING_2,
        })
      );

      result.investmentValue.keyRisks.forEach((risk, index) => {
        children.push(
          new Paragraph({
            text: `${index + 1}. ${risk}`,
            bullet: { level: 0 },
          })
        );
      });
    }

    children.push(new Paragraph({ text: '' }));
  }

  // Footer
  children.push(
    new Paragraph({
      text: `报告生成时间: ${new Date().toLocaleString('zh-CN')}`,
      alignment: AlignmentType.CENTER,
    })
  );

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
