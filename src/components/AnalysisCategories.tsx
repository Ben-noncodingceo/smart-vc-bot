import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { AnalysisResult } from '../types';
import {
  IndustryBackgroundSection,
  NationalPolicySection,
  MarketDemandSection,
  TechnologyStatusSection,
  ApplicationTrendsSection,
  BusinessModelSection,
  IndustryEcosystemSection,
  InvestmentOpportunitySection,
} from './ResultSections/AnalysisSections';

interface Props {
  result: AnalysisResult;
}

export default function AnalysisCategories({ result }: Props) {
  const items: TabsProps['items'] = [
    {
      key: 'industry-policy',
      label: '🏭 行业与政策',
      children: (
        <div>
          {result.industryBackground && <IndustryBackgroundSection data={result.industryBackground} />}
          {result.nationalPolicy && <NationalPolicySection data={result.nationalPolicy} />}
        </div>
      ),
    },
    {
      key: 'market-tech',
      label: '📊 市场与技术',
      children: (
        <div>
          {result.marketDemand && <MarketDemandSection data={result.marketDemand} />}
          {result.technologyStatus && <TechnologyStatusSection data={result.technologyStatus} />}
        </div>
      ),
    },
    {
      key: 'business-app',
      label: '💼 商业与应用',
      children: (
        <div>
          {result.businessModel && <BusinessModelSection data={result.businessModel} />}
          {result.applicationTrends && <ApplicationTrendsSection data={result.applicationTrends} />}
        </div>
      ),
    },
    {
      key: 'ecosystem-investment',
      label: '🎯 产业与投资',
      children: (
        <div>
          {result.industryEcosystem && <IndustryEcosystemSection data={result.industryEcosystem} />}
          {result.investmentOpportunity && <InvestmentOpportunitySection data={result.investmentOpportunity} />}
        </div>
      ),
    },
  ];

  return (
    <Tabs
      defaultActiveKey="industry-policy"
      items={items}
      size="large"
      style={{ marginTop: 24 }}
    />
  );
}
