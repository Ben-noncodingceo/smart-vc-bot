import { Card, Descriptions, Table, Tag, Typography, List, Empty } from 'antd';
import {
  MarketCapAnalysis,
  FrontierAnalysis,
  PublicPeersAnalysis,
  StageAnalysis,
  ProfitAnalysis,
  PolicyRiskAnalysis,
  InvestmentValueAnalysis,
  FinancingCasesAnalysis,
  PapersAnalysis,
  CompanyProfile
} from '../../types';

const { Paragraph, Text } = Typography;

// Market Cap Section
export function MarketCapSection({ data }: { data: MarketCapAnalysis }) {
  return (
    <Card title="行业 Market Cap" className="section-card">
      <Descriptions column={1} bordered>
        <Descriptions.Item label="行业定义">
          {data.industryDefinition}
        </Descriptions.Item>

        {data.globalMarketCapRange && (
          <Descriptions.Item label="全球市值区间">
            {data.globalMarketCapRange.min !== null ? data.globalMarketCapRange.min.toLocaleString() : 'N/A'} - {data.globalMarketCapRange.max !== null ? data.globalMarketCapRange.max.toLocaleString() : 'N/A'} {data.globalMarketCapRange.currency}
          </Descriptions.Item>
        )}

        {data.keyPublicCompanies && data.keyPublicCompanies.length > 0 && (
          <Descriptions.Item label="关键上市公司">
            <List
              size="small"
              dataSource={data.keyPublicCompanies}
              renderItem={company => (
                <List.Item>
                  <Text strong>{company.name}</Text>
                  {company.ticker && ` (${company.ticker})`}
                  {company.exchange && ` - ${company.exchange}`}
                  {company.country && ` - ${company.country}`}
                </List.Item>
              )}
            />
          </Descriptions.Item>
        )}

        {data.notes && (
          <Descriptions.Item label="备注">
            {data.notes}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}

// Frontier Section
export function FrontierSection({ data }: { data: FrontierAnalysis }) {
  return (
    <Card title="行业前沿发展" className="section-card">
      <Paragraph>
        <Text strong>时间范围：</Text>{data.timeHorizon}
      </Paragraph>

      <Paragraph>
        <Text strong>关键趋势：</Text>
      </Paragraph>
      <List
        size="small"
        dataSource={data.keyTrends}
        renderItem={(trend, index) => (
          <List.Item>
            {index + 1}. {trend}
          </List.Item>
        )}
      />

      {data.notes && (
        <Paragraph type="secondary">
          <Text strong>备注：</Text>{data.notes}
        </Paragraph>
      )}
    </Card>
  );
}

// Public Peers Section
export function PublicPeersSection({ data }: { data: PublicPeersAnalysis }) {
  const columns = [
    { title: '公司名称', dataIndex: 'name', key: 'name' },
    { title: '股票代码', dataIndex: 'ticker', key: 'ticker', render: (text: string) => text || 'N/A' },
    { title: '交易所', dataIndex: 'exchange', key: 'exchange', render: (text: string) => text || 'N/A' },
    { title: '国家', dataIndex: 'country', key: 'country', render: (text: string) => text || 'N/A' },
    {
      title: '是否可比',
      dataIndex: 'isComparable',
      key: 'isComparable',
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'default'}>{value ? '是' : '否'}</Tag>
      )
    }
  ];

  return (
    <Card title="国际相似上市公司" className="section-card">
      <Paragraph>
        <Text strong>是否有可比公司：</Text>
        <Tag color={data.hasComparablePeers ? 'green' : 'default'}>
          {data.hasComparablePeers ? '是' : '否'}
        </Tag>
      </Paragraph>

      {data.peers && data.peers.length > 0 ? (
        <>
          <Table
            dataSource={data.peers}
            columns={columns}
            pagination={false}
            size="small"
            rowKey="name"
          />

          {data.peers.map((peer, index) => (
            peer.last3YearsCoreMetrics && peer.last3YearsCoreMetrics.length > 0 && (
              <div key={index} style={{ marginTop: 16 }}>
                <Text strong>{peer.name} - 近3年核心数据</Text>
                <Table
                  dataSource={peer.last3YearsCoreMetrics}
                  columns={[
                    { title: '年份', dataIndex: 'year', key: 'year' },
                    {
                      title: '收入',
                      dataIndex: 'revenue',
                      key: 'revenue',
                      render: (value: number | null, record: any) =>
                        value !== null ? `${value.toLocaleString()} ${record.currency || ''}` : 'N/A'
                    },
                    {
                      title: '利润',
                      dataIndex: 'profit',
                      key: 'profit',
                      render: (value: number | null, record: any) =>
                        value !== null ? `${value.toLocaleString()} ${record.currency || ''}` : 'N/A'
                    },
                    {
                      title: '市值',
                      dataIndex: 'marketCap',
                      key: 'marketCap',
                      render: (value: number | null, record: any) =>
                        value !== null ? `${value.toLocaleString()} ${record.currency || ''}` : 'N/A'
                    }
                  ]}
                  pagination={false}
                  size="small"
                />
              </div>
            )
          ))}
        </>
      ) : (
        <Empty description="未找到可比公司" />
      )}

      {data.notes && (
        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          <Text strong>备注：</Text>{data.notes}
        </Paragraph>
      )}
    </Card>
  );
}

// Stage Section
export function StageSection({ data }: { data: StageAnalysis }) {
  const getStageColor = (stage: string | undefined) => {
    const colors: Record<string, string> = {
      seed: 'magenta',
      preA: 'red',
      seriesA: 'volcano',
      seriesB: 'orange',
      seriesC: 'gold',
      preIPO: 'green',
      unknown: 'default'
    };
    return colors[stage || 'unknown'] || 'default';
  };

  return (
    <Card title="企业阶段判断" className="section-card">
      <Paragraph>
        <Text strong>阶段：</Text>
        <Tag color={getStageColor(data.stage)} style={{ marginLeft: 8 }}>
          {data.stage}
        </Tag>
      </Paragraph>

      <Paragraph>
        <Text strong>判断依据：</Text>
      </Paragraph>
      <Paragraph>{data.reasoning}</Paragraph>
    </Card>
  );
}

// Revenue Section
export function RevenueSection({ data }: { data: CompanyProfile['revenueByYear'] }) {
  if (!data || data.length === 0) {
    return (
      <Card title="企业 Revenue 按年" className="section-card">
        <Empty description="暂无收入数据" />
      </Card>
    );
  }

  const columns = [
    { title: '年份', dataIndex: 'year', key: 'year' },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number | null, record: any) =>
        value !== null ? `${value.toLocaleString()} ${record.currency || ''}` : 'N/A'
    },
    { title: '备注', dataIndex: 'note', key: 'note', render: (text: string) => text || '-' }
  ];

  return (
    <Card title="企业 Revenue 按年" className="section-card">
      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        size="small"
      />
    </Card>
  );
}

// Profit Section
export function ProfitSection({ data }: { data: ProfitAnalysis }) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      profitable: 'green',
      lossMaking: 'red',
      breakeven: 'orange',
      unknown: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      profitable: '盈利',
      lossMaking: '亏损',
      breakeven: '持平',
      unknown: '未知'
    };
    return texts[status] || status;
  };

  return (
    <Card title="盈利情况" className="section-card">
      <Descriptions column={1} bordered>
        <Descriptions.Item label="当前状态">
          <Tag color={getStatusColor(data.currentStatus)}>
            {getStatusText(data.currentStatus)}
          </Tag>
        </Descriptions.Item>

        {data.unitEconomics && (
          <Descriptions.Item label="单位经济">
            {data.unitEconomics}
          </Descriptions.Item>
        )}

        {data.potentialPathToProfitability && (
          <Descriptions.Item label="潜在盈利路径">
            {data.potentialPathToProfitability}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}

// Policy Risk Section
export function PolicyRiskSection({ data }: { data: PolicyRiskAnalysis }) {
  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      unknown: 'default'
    };
    return colors[level] || 'default';
  };

  const getRiskText = (level: string) => {
    const texts: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      unknown: '未知'
    };
    return texts[level] || level;
  };

  return (
    <Card title="政策风险" className="section-card">
      <Paragraph>
        <Text strong>风险等级：</Text>
        <Tag color={getRiskColor(data.riskLevel)} style={{ marginLeft: 8 }}>
          {getRiskText(data.riskLevel)}
        </Tag>
      </Paragraph>

      {data.keyRisks && data.keyRisks.length > 0 && (
        <>
          <Paragraph>
            <Text strong>关键风险点：</Text>
          </Paragraph>
          <List
            size="small"
            dataSource={data.keyRisks}
            renderItem={(risk, index) => (
              <List.Item>{index + 1}. {risk}</List.Item>
            )}
          />
        </>
      )}

      {data.jurisdictions && data.jurisdictions.length > 0 && (
        <Paragraph style={{ marginTop: 16 }}>
          <Text strong>涉及地区：</Text>
          {data.jurisdictions.map((j, i) => (
            <Tag key={i} style={{ margin: '4px' }}>{j}</Tag>
          ))}
        </Paragraph>
      )}
    </Card>
  );
}

// Investment Value Section
export function InvestmentValueSection({ data }: { data: InvestmentValueAnalysis }) {
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
    <Card title="投资价值评级" className="section-card">
      <Paragraph>
        <Text strong>评级：</Text>
        <Tag color={getRatingColor(data.rating)} style={{ marginLeft: 8, fontSize: 16 }}>
          {getRatingText(data.rating)}
        </Tag>
      </Paragraph>

      {data.keyUpsides && data.keyUpsides.length > 0 && (
        <>
          <Paragraph>
            <Text strong>关键投资亮点：</Text>
          </Paragraph>
          <List
            size="small"
            dataSource={data.keyUpsides}
            renderItem={(upside, index) => (
              <List.Item>
                <Tag color="green">{index + 1}</Tag> {upside}
              </List.Item>
            )}
          />
        </>
      )}

      {data.keyRisks && data.keyRisks.length > 0 && (
        <>
          <Paragraph style={{ marginTop: 16 }}>
            <Text strong>关键风险点：</Text>
          </Paragraph>
          <List
            size="small"
            dataSource={data.keyRisks}
            renderItem={(risk, index) => (
              <List.Item>
                <Tag color="red">{index + 1}</Tag> {risk}
              </List.Item>
            )}
          />
        </>
      )}

      {data.targetInvestorProfile && (
        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          <Text strong>目标投资人画像：</Text>{data.targetInvestorProfile}
        </Paragraph>
      )}
    </Card>
  );
}

// Financing Cases Section
export function FinancingCasesSection({ data }: { data: FinancingCasesAnalysis }) {
  if (!data.cases || data.cases.length === 0) {
    return (
      <Card title="相似企业融资案例" className="section-card">
        <Empty description="暂无融资案例数据" />
      </Card>
    );
  }

  const columns = [
    { title: '公司名称', dataIndex: 'companyName', key: 'companyName' },
    { title: '地区', dataIndex: 'region', key: 'region', render: (text: string) => text || 'N/A' },
    { title: '轮次', dataIndex: 'round', key: 'round', render: (text: string) => text || 'N/A' },
    {
      title: '金额',
      key: 'amount',
      render: (record: any) =>
        record.amount !== null ? `${record.amount.toLocaleString()} ${record.currency || ''}` : 'N/A'
    },
    { title: '日期', dataIndex: 'date', key: 'date', render: (text: string) => text || 'N/A' },
    {
      title: '主导机构',
      dataIndex: 'leadInvestors',
      key: 'leadInvestors',
      render: (investors: string[]) => Array.isArray(investors) && investors.length > 0 ? investors.join(', ') : 'N/A'
    }
  ];

  return (
    <Card title="相似企业融资案例" className="section-card">
      <Table
        dataSource={data.cases}
        columns={columns}
        pagination={{ pageSize: 10 }}
        size="small"
      />

      {data.notes && (
        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          <Text strong>备注：</Text>{data.notes}
        </Paragraph>
      )}
    </Card>
  );
}

// Papers Section
export function PapersSection({ data }: { data: PapersAnalysis }) {
  if (!data.isHighTechIndustry) {
    return (
      <Card title="科研文献" className="section-card">
        <Empty description="非高科技行业，不适用科研文献分析" />
      </Card>
    );
  }

  if (!data.papers || data.papers.length === 0) {
    return (
      <Card title="科研文献" className="section-card">
        <Empty description="暂无相关科研文献" />
      </Card>
    );
  }

  return (
    <Card title="科研文献（过去2年）" className="section-card">
      <List
        itemLayout="vertical"
        dataSource={data.papers}
        renderItem={(paper, index) => (
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

      {data.notes && (
        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          <Text strong>备注：</Text>{data.notes}
        </Paragraph>
      )}
    </Card>
  );
}
