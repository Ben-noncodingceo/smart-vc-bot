import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { AnalysisResult } from '../types';
import {
  MarketCapSection,
  FrontierSection,
  PublicPeersSection,
  PapersSection,
  StageSection,
  RevenueSection,
  ProfitSection,
  PolicyRiskSection,
  InvestmentValueSection,
  FinancingCasesSection,
} from './ResultSections/AnalysisSections';

interface Props {
  result: AnalysisResult;
}

export default function AnalysisCategories({ result }: Props) {
  const items: TabsProps['items'] = [
    {
      key: 'technical',
      label: '🔬 技术分析判断',
      children: (
        <div>
          {result.papers && <PapersSection data={result.papers} />}
          {result.frontier && <FrontierSection data={result.frontier} />}
          {result.publicPeers && <PublicPeersSection data={result.publicPeers} />}
        </div>
      ),
    },
    {
      key: 'business',
      label: '💼 商业分析判断',
      children: (
        <div>
          {result.marketCap && <MarketCapSection data={result.marketCap} />}
          {result.revenue && <RevenueSection data={result.revenue} />}
          {result.profit && <ProfitSection data={result.profit} />}
          {result.investmentValue && <InvestmentValueSection data={result.investmentValue} />}
          {result.financingCases && <FinancingCasesSection data={result.financingCases} />}
          {result.policyRisk && <PolicyRiskSection data={result.policyRisk} />}
        </div>
      ),
    },
    {
      key: 'team',
      label: '👥 团队执行分析判断',
      children: (
        <div>
          {result.stage && <StageSection data={result.stage} />}
          {result.revenue && <RevenueSection data={result.revenue} />}
          {result.profit && <ProfitSection data={result.profit} />}
        </div>
      ),
    },
  ];

  return (
    <Tabs
      defaultActiveKey="business"
      items={items}
      size="large"
      style={{ marginTop: 24 }}
    />
  );
}
