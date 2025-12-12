import { Card, Descriptions, Table, Tag, Typography, List, Empty, Progress } from 'antd';
import {
  IndustryBackgroundAnalysis,
  NationalPolicyAnalysis,
  MarketDemandAnalysis,
  TechnologyStatusAnalysis,
  ApplicationTrendsAnalysis,
  BusinessModelAnalysis,
  IndustryEcosystemAnalysis,
  InvestmentOpportunityAnalysis,
  PaperInfo,
  CompanyProfile
} from '../../types';

const { Paragraph, Text } = Typography;

// 1. Industry Background Section (行业背景简述)
export function IndustryBackgroundSection({ data }: { data: IndustryBackgroundAnalysis }) {
  return (
    <Card title="行业背景简述" className="section-card">
      <Descriptions column={1} bordered>
        <Descriptions.Item label="行业概况">
          {data.industryOverview}
        </Descriptions.Item>

        <Descriptions.Item label="市场规模">
          {data.marketSize.global !== null && data.marketSize.global !== undefined && (
            <div>全球: {data.marketSize.global.toLocaleString()} {data.marketSize.currency}</div>
          )}
          {data.marketSize.china !== null && data.marketSize.china !== undefined && (
            <div>中国: {data.marketSize.china.toLocaleString()} {data.marketSize.currency}</div>
          )}
          <div style={{ marginTop: 4 }}>
            <Text type="secondary">数据年份: {data.marketSize.year}</Text>
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="主要参与者">
          <List
            size="small"
            dataSource={data.keyPlayers}
            renderItem={(player, index) => (
              <List.Item>{index + 1}. {player}</List.Item>
            )}
          />
        </Descriptions.Item>

        <Descriptions.Item label="发展阶段">
          <Tag color="blue">{data.developmentStage}</Tag>
        </Descriptions.Item>

        {data.notes && (
          <Descriptions.Item label="备注">
            {data.notes}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}

// 2. National Policy Section (国家政策简述)
export function NationalPolicySection({ data }: { data: NationalPolicyAnalysis }) {
  const getPolicyColor = (support: string) => {
    const colors: Record<string, string> = {
      strong: 'green',
      moderate: 'orange',
      weak: 'red',
      unknown: 'default'
    };
    return colors[support] || 'default';
  };

  const getPolicyText = (support: string) => {
    const texts: Record<string, string> = {
      strong: '强',
      moderate: '中等',
      weak: '弱',
      unknown: '未知'
    };
    return texts[support] || support;
  };

  return (
    <Card title="国家政策简述" className="section-card">
      <Paragraph>
        <Text strong>政策支持力度：</Text>
        <Tag color={getPolicyColor(data.policySupport)} style={{ marginLeft: 8 }}>
          {getPolicyText(data.policySupport)}
        </Tag>
      </Paragraph>

      {data.relevantPolicies && data.relevantPolicies.length > 0 && (
        <>
          <Paragraph>
            <Text strong>相关政策：</Text>
          </Paragraph>
          <List
            itemLayout="vertical"
            dataSource={data.relevantPolicies}
            renderItem={(policy, index) => (
              <List.Item key={index}>
                <List.Item.Meta
                  title={
                    <>
                      <Tag color="blue">{index + 1}</Tag>
                      {policy.policyName}
                    </>
                  }
                  description={
                    <>
                      <Text type="secondary">
                        发布机构: {policy.issuingAuthority}
                        {policy.effectiveDate && ` • 生效日期: ${policy.effectiveDate}`}
                      </Text>
                    </>
                  }
                />
                <Paragraph>{policy.summary}</Paragraph>
              </List.Item>
            )}
          />
        </>
      )}

      {data.regulatoryRisks && data.regulatoryRisks.length > 0 && (
        <>
          <Paragraph style={{ marginTop: 16 }}>
            <Text strong>监管风险：</Text>
          </Paragraph>
          <List
            size="small"
            dataSource={data.regulatoryRisks}
            renderItem={(risk, index) => (
              <List.Item>
                <Tag color="red">{index + 1}</Tag> {risk}
              </List.Item>
            )}
          />
        </>
      )}

      {data.notes && (
        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          <Text strong>备注：</Text>{data.notes}
        </Paragraph>
      )}
    </Card>
  );
}

// 3. Market Demand Section (市场需求分析)
export function MarketDemandSection({ data }: { data: MarketDemandAnalysis }) {
  return (
    <Card title="市场需求分析" className="section-card">
      {data.marketGrowthRate !== null && data.marketGrowthRate !== undefined && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>市场增长率：</Text>
          <Progress
            percent={data.marketGrowthRate}
            format={(percent) => `${percent}%`}
            strokeColor="#52c41a"
          />
        </div>
      )}

      <Descriptions column={1} bordered>
        <Descriptions.Item label="目标客户群体">
          <List
            size="small"
            dataSource={data.targetCustomers}
            renderItem={(customer, index) => (
              <List.Item>{index + 1}. {customer}</List.Item>
            )}
          />
        </Descriptions.Item>

        <Descriptions.Item label="客户痛点">
          <List
            size="small"
            dataSource={data.painPoints}
            renderItem={(pain, index) => (
              <List.Item>
                <Tag color="volcano">{index + 1}</Tag> {pain}
              </List.Item>
            )}
          />
        </Descriptions.Item>

        <Descriptions.Item label="需求驱动因素">
          <List
            size="small"
            dataSource={data.demandDrivers}
            renderItem={(driver, index) => (
              <List.Item>
                <Tag color="green">{index + 1}</Tag> {driver}
              </List.Item>
            )}
          />
        </Descriptions.Item>

        <Descriptions.Item label="竞争格局">
          {data.competitiveLandscape}
        </Descriptions.Item>

        {data.notes && (
          <Descriptions.Item label="备注">
            {data.notes}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}

// 4. Technology Status Section (技术现状 - 前沿论文)
export function TechnologyStatusSection({ data }: { data: TechnologyStatusAnalysis }) {
  const getMaturityColor = (maturity: string) => {
    const colors: Record<string, string> = {
      early: 'magenta',
      growing: 'orange',
      mature: 'green',
      declining: 'red'
    };
    return colors[maturity] || 'default';
  };

  const getMaturityText = (maturity: string) => {
    const texts: Record<string, string> = {
      early: '早期',
      growing: '成长期',
      mature: '成熟期',
      declining: '衰退期'
    };
    return texts[maturity] || maturity;
  };

  return (
    <Card title="技术现状" className="section-card">
      <Paragraph>
        <Text strong>技术概况：</Text>
        <div style={{ marginTop: 8 }}>{data.technologyOverview}</div>
      </Paragraph>

      <Paragraph>
        <Text strong>技术成熟度：</Text>
        <Tag color={getMaturityColor(data.technologyMaturity)} style={{ marginLeft: 8 }}>
          {getMaturityText(data.technologyMaturity)}
        </Tag>
      </Paragraph>

      <Descriptions column={1} bordered style={{ marginBottom: 16 }}>
        <Descriptions.Item label="核心技术">
          <List
            size="small"
            dataSource={data.coreTechnologies}
            renderItem={(tech, index) => (
              <List.Item>
                <Tag color="blue">{index + 1}</Tag> {tech}
              </List.Item>
            )}
          />
        </Descriptions.Item>

        <Descriptions.Item label="技术壁垒">
          <List
            size="small"
            dataSource={data.technicalBarriers}
            renderItem={(barrier, index) => (
              <List.Item>
                <Tag color="red">{index + 1}</Tag> {barrier}
              </List.Item>
            )}
          />
        </Descriptions.Item>
      </Descriptions>

      {data.papers && data.papers.length > 0 ? (
        <>
          <Paragraph>
            <Text strong>前沿论文（近2年）：</Text>
          </Paragraph>
          <List
            itemLayout="vertical"
            dataSource={data.papers}
            renderItem={(paper: PaperInfo, index) => (
              <List.Item key={index}>
                <List.Item.Meta
                  title={
                    <>
                      <Tag color="blue">{index + 1}</Tag>
                      {paper.link ? (
                        <a href={paper.link} target="_blank" rel="noopener noreferrer">
                          {paper.title}
                        </a>
                      ) : (
                        paper.title
                      )}
                    </>
                  }
                  description={
                    <>
                      <Text type="secondary">
                        {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors} • {paper.year}
                        {paper.venue && ` • ${paper.venue}`}
                      </Text>
                    </>
                  }
                />
                <Paragraph>{paper.summary}</Paragraph>
                <Paragraph>
                  <Text strong>核心挑战：</Text>{paper.keyChallenges}
                </Paragraph>
              </List.Item>
            )}
          />
        </>
      ) : (
        <Empty description="暂无相关前沿论文" />
      )}

      {data.notes && (
        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          <Text strong>备注：</Text>{data.notes}
        </Paragraph>
      )}
    </Card>
  );
}

// 5. Application Trends Section (应用趋势)
export function ApplicationTrendsSection({ data }: { data: ApplicationTrendsAnalysis }) {
  const getRateColor = (rate: string) => {
    const colors: Record<string, string> = {
      high: 'green',
      medium: 'orange',
      low: 'red',
      unknown: 'default'
    };
    return colors[rate] || 'default';
  };

  const getRateText = (rate: string) => {
    const texts: Record<string, string> = {
      high: '高',
      medium: '中',
      low: '低',
      unknown: '未知'
    };
    return texts[rate] || rate;
  };

  return (
    <Card title="应用趋势" className="section-card">
      <Paragraph>
        <Text strong>应用普及率：</Text>
        <Tag color={getRateColor(data.adoptionRate)} style={{ marginLeft: 8 }}>
          {getRateText(data.adoptionRate)}
        </Tag>
        <Text type="secondary" style={{ marginLeft: 12 }}>
          时间范围: {data.timeHorizon}
        </Text>
      </Paragraph>

      <Descriptions column={1} bordered style={{ marginBottom: 16 }}>
        <Descriptions.Item label="当前应用场景">
          <List
            size="small"
            dataSource={data.currentApplications}
            renderItem={(app, index) => (
              <List.Item>
                <Tag color="blue">{index + 1}</Tag> {app}
              </List.Item>
            )}
          />
        </Descriptions.Item>

        <Descriptions.Item label="新兴应用场景">
          <List
            size="small"
            dataSource={data.emergingApplications}
            renderItem={(app, index) => (
              <List.Item>
                <Tag color="green">{index + 1}</Tag> {app}
              </List.Item>
            )}
          />
        </Descriptions.Item>

        <Descriptions.Item label="未来前景">
          {data.futureProspects}
        </Descriptions.Item>

        {data.notes && (
          <Descriptions.Item label="备注">
            {data.notes}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}

// 6. Business Model Section (商业模式)
export function BusinessModelSection({ data }: { data: BusinessModelAnalysis }) {
  const getScalabilityColor = (scalability: string) => {
    const colors: Record<string, string> = {
      high: 'green',
      medium: 'orange',
      low: 'red'
    };
    return colors[scalability] || 'default';
  };

  const getScalabilityText = (scalability: string) => {
    const texts: Record<string, string> = {
      high: '高',
      medium: '中',
      low: '低'
    };
    return texts[scalability] || scalability;
  };

  return (
    <Card title="商业模式" className="section-card">
      <Paragraph>
        <Text strong>可扩展性：</Text>
        <Tag color={getScalabilityColor(data.scalability)} style={{ marginLeft: 8 }}>
          {getScalabilityText(data.scalability)}
        </Tag>
      </Paragraph>

      <Descriptions column={1} bordered>
        <Descriptions.Item label="价值主张">
          {data.valueProposition}
        </Descriptions.Item>

        <Descriptions.Item label="收入来源">
          <List
            size="small"
            dataSource={data.revenueStreams}
            renderItem={(stream, index) => (
              <List.Item>
                <Tag color="green">{index + 1}</Tag> {stream}
              </List.Item>
            )}
          />
        </Descriptions.Item>

        <Descriptions.Item label="成本结构">
          {data.costStructure}
        </Descriptions.Item>

        <Descriptions.Item label="客户渠道">
          <List
            size="small"
            dataSource={data.customerChannels}
            renderItem={(channel, index) => (
              <List.Item>
                <Tag color="blue">{index + 1}</Tag> {channel}
              </List.Item>
            )}
          />
        </Descriptions.Item>

        <Descriptions.Item label="关键资源">
          <List
            size="small"
            dataSource={data.keyResources}
            renderItem={(resource, index) => (
              <List.Item>
                <Tag color="purple">{index + 1}</Tag> {resource}
              </List.Item>
            )}
          />
        </Descriptions.Item>

        <Descriptions.Item label="关键活动">
          <List
            size="small"
            dataSource={data.keyActivities}
            renderItem={(activity, index) => (
              <List.Item>
                <Tag color="cyan">{index + 1}</Tag> {activity}
              </List.Item>
            )}
          />
        </Descriptions.Item>

        {data.notes && (
          <Descriptions.Item label="备注">
            {data.notes}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}

// 7. Industry Ecosystem Section (产业格局、上下游关系)
export function IndustryEcosystemSection({ data }: { data: IndustryEcosystemAnalysis }) {
  const getPowerColor = (power: string) => {
    const colors: Record<string, string> = {
      strong: 'red',
      moderate: 'orange',
      weak: 'green'
    };
    return colors[power] || 'default';
  };

  const getPowerText = (power: string) => {
    const texts: Record<string, string> = {
      strong: '强',
      moderate: '中',
      weak: '弱'
    };
    return texts[power] || power;
  };

  return (
    <Card title="产业格局、上下游关系" className="section-card">
      <Descriptions column={1} bordered style={{ marginBottom: 16 }}>
        <Descriptions.Item label="价值链定位">
          {data.valueChainPosition}
        </Descriptions.Item>
      </Descriptions>

      {/* Upstream Suppliers */}
      {data.upstreamSuppliers && data.upstreamSuppliers.length > 0 && (
        <>
          <Paragraph>
            <Text strong>上游供应商：</Text>
          </Paragraph>
          <List
            dataSource={data.upstreamSuppliers}
            renderItem={(supplier, index) => (
              <List.Item key={index}>
                <div style={{ width: '100%' }}>
                  <Text strong>{supplier.category}</Text>
                  <Tag color={getPowerColor(supplier.bargainingPower)} style={{ marginLeft: 8 }}>
                    议价能力: {getPowerText(supplier.bargainingPower)}
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    {supplier.keyPlayers.map((player, i) => (
                      <Tag key={i} color="blue" style={{ marginBottom: 4 }}>
                        {player}
                      </Tag>
                    ))}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </>
      )}

      {/* Downstream Customers */}
      {data.downstreamCustomers && data.downstreamCustomers.length > 0 && (
        <>
          <Paragraph style={{ marginTop: 16 }}>
            <Text strong>下游客户：</Text>
          </Paragraph>
          <List
            dataSource={data.downstreamCustomers}
            renderItem={(customer, index) => (
              <List.Item key={index}>
                <div style={{ width: '100%' }}>
                  <Text strong>{customer.category}</Text>
                  <Tag color={getPowerColor(customer.bargainingPower)} style={{ marginLeft: 8 }}>
                    议价能力: {getPowerText(customer.bargainingPower)}
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    {customer.keyPlayers.map((player, i) => (
                      <Tag key={i} color="green" style={{ marginBottom: 4 }}>
                        {player}
                      </Tag>
                    ))}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </>
      )}

      {/* Competitors */}
      {data.competitors && data.competitors.length > 0 && (
        <>
          <Paragraph style={{ marginTop: 16 }}>
            <Text strong>主要竞争对手：</Text>
          </Paragraph>
          <Table
            dataSource={data.competitors}
            columns={[
              { title: '企业名称', dataIndex: 'name', key: 'name' },
              {
                title: '市场份额',
                dataIndex: 'marketShare',
                key: 'marketShare',
                render: (value: number | null) => value !== null ? `${value}%` : 'N/A'
              },
              {
                title: '优势',
                dataIndex: 'strengths',
                key: 'strengths',
                render: (strengths: string[]) => (
                  <>
                    {strengths.map((s, i) => (
                      <Tag key={i} color="green" style={{ marginBottom: 4 }}>
                        {s}
                      </Tag>
                    ))}
                  </>
                )
              },
              {
                title: '劣势',
                dataIndex: 'weaknesses',
                key: 'weaknesses',
                render: (weaknesses: string[]) => (
                  <>
                    {weaknesses.map((w, i) => (
                      <Tag key={i} color="red" style={{ marginBottom: 4 }}>
                        {w}
                      </Tag>
                    ))}
                  </>
                )
              }
            ]}
            pagination={false}
            size="small"
          />
        </>
      )}

      {data.notes && (
        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          <Text strong>备注：</Text>{data.notes}
        </Paragraph>
      )}
    </Card>
  );
}

// 8. Investment Opportunity Section (投资机会、投资价值)
export function InvestmentOpportunitySection({ data }: { data: InvestmentOpportunityAnalysis }) {
  const getRatingColor = (rating: string) => {
    const colors: Record<string, string> = {
      high: 'green',
      medium: 'orange',
      low: 'red'
    };
    return colors[rating] || 'default';
  };

  const getRatingText = (rating: string) => {
    const texts: Record<string, string> = {
      high: '高',
      medium: '中',
      low: '低'
    };
    return texts[rating] || rating;
  };

  return (
    <Card title="投资机会、投资价值" className="section-card">
      <Paragraph>
        <Text strong>投资评级：</Text>
        <Tag color={getRatingColor(data.investmentRating)} style={{ marginLeft: 8, fontSize: 16 }}>
          {getRatingText(data.investmentRating)}
        </Tag>
      </Paragraph>

      {data.valuationRange && (
        <Paragraph>
          <Text strong>估值区间：</Text>
          <Text style={{ marginLeft: 8 }}>
            {data.valuationRange.min !== null ? data.valuationRange.min.toLocaleString() : 'N/A'} -
            {data.valuationRange.max !== null ? data.valuationRange.max.toLocaleString() : 'N/A'} {data.valuationRange.currency}
          </Text>
        </Paragraph>
      )}

      <Descriptions column={1} bordered style={{ marginBottom: 16 }}>
        <Descriptions.Item label="建议投资阶段">
          <Tag color="blue">{data.recommendedInvestmentStage}</Tag>
        </Descriptions.Item>

        {data.targetReturn && (
          <Descriptions.Item label="目标回报">
            {data.targetReturn}
          </Descriptions.Item>
        )}

        {data.timeframe && (
          <Descriptions.Item label="投资周期">
            {data.timeframe}
          </Descriptions.Item>
        )}
      </Descriptions>

      {data.keyInvestmentHighlights && data.keyInvestmentHighlights.length > 0 && (
        <>
          <Paragraph>
            <Text strong>关键投资亮点：</Text>
          </Paragraph>
          <List
            size="small"
            dataSource={data.keyInvestmentHighlights}
            renderItem={(highlight, index) => (
              <List.Item>
                <Tag color="green">{index + 1}</Tag> {highlight}
              </List.Item>
            )}
          />
        </>
      )}

      {data.riskFactors && data.riskFactors.length > 0 && (
        <>
          <Paragraph style={{ marginTop: 16 }}>
            <Text strong>风险因素：</Text>
          </Paragraph>
          <List
            size="small"
            dataSource={data.riskFactors}
            renderItem={(risk, index) => (
              <List.Item>
                <Tag color="red">{index + 1}</Tag> {risk}
              </List.Item>
            )}
          />
        </>
      )}

      {data.exitStrategy && data.exitStrategy.length > 0 && (
        <>
          <Paragraph style={{ marginTop: 16 }}>
            <Text strong>退出策略：</Text>
          </Paragraph>
          <div>
            {data.exitStrategy.map((strategy, index) => (
              <Tag key={index} color="purple" style={{ marginBottom: 4 }}>
                {strategy}
              </Tag>
            ))}
          </div>
        </>
      )}

      {data.notes && (
        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          <Text strong>备注：</Text>{data.notes}
        </Paragraph>
      )}
    </Card>
  );
}
