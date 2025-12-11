import { Card, Descriptions, Tag } from 'antd';
import { CompanyProfile } from '../../types';

interface Props {
  profile: CompanyProfile;
}

export default function CompanySummary({ profile }: Props) {
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
    <Card title="企业概要" className="section-card">
      <Descriptions column={2} bordered>
        <Descriptions.Item label="公司名称" span={2}>
          <strong style={{ fontSize: 18 }}>{profile.name}</strong>
        </Descriptions.Item>

        <Descriptions.Item label="所属行业">
          <Tag color="blue">{profile.industry}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="所在国家/地区">
          {profile.countryOrRegion}
        </Descriptions.Item>

        <Descriptions.Item label="企业阶段">
          <Tag color={getStageColor(profile.inferredStage)}>
            {profile.inferredStage || 'unknown'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="是否高科技">
          {profile.isHighTech ? (
            <Tag color="green">是</Tag>
          ) : (
            <Tag>否</Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="企业简介" span={2}>
          {profile.shortDescription}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
