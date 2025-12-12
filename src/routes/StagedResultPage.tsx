import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Alert,
  Space,
  Typography,
  Steps,
  Progress,
  Divider,
  message
} from 'antd';
import {
  CheckCircleOutlined,
  DownloadOutlined,
  HomeOutlined,
  LoadingOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useAppStore } from '../lib/store';
import { useStagedAnalysis } from '../hooks/useStagedAnalysis';
import { exportAsJSON, exportAsMarkdown, downloadFile } from '../lib/export';

import CompanySummary from '../components/ResultSections/CompanySummary';
import { AnalysisStage, ANALYSIS_STAGES } from '../types';
import {
  PapersSection,
  FrontierSection,
  PublicPeersSection,
  MarketCapSection,
  RevenueSection,
  ProfitSection,
  FinancingCasesSection,
  PolicyRiskSection,
  StageSection,
  InvestmentValueSection
} from '../components/ResultSections/AnalysisSections';

const { Title, Paragraph, Text } = Typography;

export default function StagedResultPage() {
  const navigate = useNavigate();
  const {
    analysisError,
    reset
  } = useAppStore();

  const {
    isAnalyzing,
    stagedState,
    analyzeStage,
    getCombinedResults,
    resetStagedAnalysis,
    getNextStage,
    isAllStagesCompleted
  } = useStagedAnalysis();

  const stages = ANALYSIS_STAGES;

  useEffect(() => {
    // Redirect if no company profile has been extracted
    if (!stagedState.companyProfile) {
      navigate('/upload');
    }
  }, [stagedState.companyProfile, navigate]);

  const handleAnalyzeNextStage = async () => {
    const nextStage = getNextStage();
    if (nextStage) {
      await analyzeStage(nextStage);
    }
  };

  const handleExportJSON = () => {
    const combinedResults = getCombinedResults();
    if (!combinedResults) return;

    const json = exportAsJSON(combinedResults);
    const filename = `${stagedState.companyProfile?.name || 'company'}_analysis_${Date.now()}.json`;
    downloadFile(json, filename, 'application/json');
    message.success('JSON 文件已下载');
  };

  const handleExportMarkdown = () => {
    const combinedResults = getCombinedResults();
    if (!combinedResults) return;

    const markdown = exportAsMarkdown(combinedResults);
    const filename = `${stagedState.companyProfile?.name || 'company'}_analysis_${Date.now()}.md`;
    downloadFile(markdown, filename, 'text/markdown');
    message.success('Markdown 文件已下载');
  };

  const handleReset = () => {
    resetStagedAnalysis();
    reset();
    navigate('/');
  };

  const progressPercent = (stagedState.completedStages.length / 4) * 100;
  const nextStage = getNextStage();
  const currentStageConfig = nextStage ? stages.find(s => s.stage === nextStage) : null;

  // Render results for each stage
  const renderStageResults = (stage: AnalysisStage) => {
    const stageResult = stagedState.stageResults.find((_, idx) =>
      stagedState.completedStages[idx] === stage
    );

    if (!stageResult) return null;

    return (
      <Card
        key={stage}
        title={`阶段 ${stage}: ${stages.find(s => s.stage === stage)?.label}`}
        style={{ marginTop: 16 }}
        type="inner"
      >
        {stage === 1 && (
          <>
            {stageResult.papers && <PapersSection data={stageResult.papers} />}
            {stageResult.frontier && <FrontierSection data={stageResult.frontier} />}
            {stageResult.publicPeers && <PublicPeersSection data={stageResult.publicPeers} />}
          </>
        )}
        {stage === 2 && (
          <>
            {stageResult.marketCap && <MarketCapSection data={stageResult.marketCap} />}
            {stageResult.revenue && <RevenueSection data={stageResult.revenue} />}
            {stageResult.profit && <ProfitSection data={stageResult.profit} />}
            {stageResult.financingCases && <FinancingCasesSection data={stageResult.financingCases} />}
            {stageResult.policyRisk && <PolicyRiskSection data={stageResult.policyRisk} />}
          </>
        )}
        {stage === 3 && (
          <>
            {stageResult.stage && <StageSection data={stageResult.stage} />}
          </>
        )}
        {stage === 4 && (
          <>
            {stageResult.investmentValue && <InvestmentValueSection data={stageResult.investmentValue} />}
          </>
        )}
      </Card>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={2} className="page-title">
          分阶段分析结果
        </Title>
        <Paragraph className="page-subtitle">
          查看各阶段分析结果并继续下一阶段
        </Paragraph>
      </div>

      <Steps
        current={2}
        items={[
          { title: '选择供应商', icon: <CheckCircleOutlined /> },
          { title: '上传配置', icon: <CheckCircleOutlined /> },
          { title: '分析结果' }
        ]}
        style={{ maxWidth: 600, margin: '0 auto 40px' }}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Error Display */}
        {analysisError && (
          <Alert
            message="分析过程中出现错误"
            description={analysisError}
            type="error"
            showIcon
            closable
          />
        )}

        {/* Company Profile */}
        {stagedState.companyProfile && (
          <CompanySummary profile={stagedState.companyProfile} />
        )}

        {/* Progress */}
        <Card title="分析进度">
          <Progress
            percent={progressPercent}
            status={isAnalyzing ? 'active' : 'normal'}
            format={() => `${stagedState.completedStages.length} / 4 阶段完成`}
          />
          <Divider />
          <Space direction="vertical" style={{ width: '100%' }}>
            {stages.map(stageConfig => {
              const isCompleted = stagedState.completedStages.includes(stageConfig.stage);
              const isCurrent = stagedState.currentStage === stageConfig.stage;

              return (
                <div key={stageConfig.stage} style={{ display: 'flex', alignItems: 'center' }}>
                  {isCompleted && <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
                  {isCurrent && <LoadingOutlined style={{ marginRight: 8 }} />}
                  {!isCompleted && !isCurrent && <span style={{ width: 14, marginRight: 8 }} />}
                  <Text strong={isCurrent || isCompleted}>
                    阶段 {stageConfig.stage}: {stageConfig.label}
                  </Text>
                  {isCurrent && <Text type="secondary" style={{ marginLeft: 8 }}>分析中...</Text>}
                </div>
              );
            })}
          </Space>
        </Card>

        {/* Completed Stage Results */}
        {stagedState.completedStages.map(stage => renderStageResults(stage))}

        {/* Next Stage Button */}
        {!isAllStagesCompleted() && nextStage && (
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Title level={4}>下一阶段：{currentStageConfig?.label}</Title>
                <Paragraph type="secondary">
                  {currentStageConfig?.description}
                </Paragraph>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<RightOutlined />}
                onClick={handleAnalyzeNextStage}
                loading={isAnalyzing}
                block
              >
                {isAnalyzing ? '分析中...' : `开始分析阶段 ${nextStage}`}
              </Button>
            </Space>
          </Card>
        )}

        {/* Export Options (only when all stages completed) */}
        {isAllStagesCompleted() && (
          <Card title="导出完整报告" className="section-card">
            <Paragraph type="secondary">
              所有阶段已完成！您可以导出完整的分析报告：
            </Paragraph>
            <Space wrap>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportJSON}
              >
                导出 JSON
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportMarkdown}
              >
                导出 Markdown
              </Button>
            </Space>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              icon={<HomeOutlined />}
              onClick={handleReset}
              disabled={isAnalyzing}
            >
              返回首页
            </Button>
          </Space>
        </Card>
      </Space>
    </div>
  );
}
