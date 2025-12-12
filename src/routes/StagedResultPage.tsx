import { useEffect, useState } from 'react';
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
  message,
  Input,
  List
} from 'antd';
import {
  CheckCircleOutlined,
  DownloadOutlined,
  HomeOutlined,
  LoadingOutlined,
  RightOutlined,
  SendOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../lib/store';
import { useStagedAnalysis } from '../hooks/useStagedAnalysis';
import { useAnalysis } from '../hooks/useAnalysis';
import { exportAsJSON, exportAsMarkdown, downloadFile, exportAsPDF, exportAsDOCX } from '../lib/export';

import CompanySummary from '../components/ResultSections/CompanySummary';
import { AnalysisStage, ANALYSIS_STAGES } from '../types';
import {
  IndustryBackgroundSection,
  NationalPolicySection,
  MarketDemandSection,
  TechnologyStatusSection,
  ApplicationTrendsSection,
  BusinessModelSection,
  IndustryEcosystemSection,
  InvestmentOpportunitySection
} from '../components/ResultSections/AnalysisSections';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function StagedResultPage() {
  const navigate = useNavigate();
  const {
    analysisError,
    chatMessages,
    reset
  } = useAppStore();

  const { sendChatMessage } = useAnalysis();
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const {
    isAnalyzing,
    companyProfile,
    currentStage,
    completedStages,
    stageResults,
    analyzeStage,
    getCombinedResults,
    resetStagedAnalysis,
    getNextStage,
    isAllStagesCompleted
  } = useStagedAnalysis();

  const stages = ANALYSIS_STAGES;

  useEffect(() => {
    // Redirect if no company profile has been extracted
    if (!companyProfile) {
      navigate('/upload');
    }
  }, [companyProfile, navigate]);

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
    const filename = `${companyProfile?.name || 'company'}_analysis_${Date.now()}.json`;
    downloadFile(json, filename, 'application/json');
    message.success('JSON 文件已下载');
  };

  const handleExportMarkdown = () => {
    const combinedResults = getCombinedResults();
    if (!combinedResults) return;

    const markdown = exportAsMarkdown(combinedResults);
    const filename = `${companyProfile?.name || 'company'}_analysis_${Date.now()}.md`;
    downloadFile(markdown, filename, 'text/markdown');
    message.success('Markdown 文件已下载');
  };

  const handleExportPDF = async () => {
    const combinedResults = getCombinedResults();
    if (!combinedResults) return;

    try {
      const filename = `${companyProfile?.name || 'company'}_analysis_${Date.now()}.pdf`;
      await exportAsPDF(combinedResults, filename);
      message.success('PDF 文件已下载');
    } catch (error) {
      message.error('PDF 导出失败');
    }
  };

  const handleExportDOCX = async () => {
    const combinedResults = getCombinedResults();
    if (!combinedResults) return;

    try {
      const filename = `${companyProfile?.name || 'company'}_analysis_${Date.now()}.docx`;
      await exportAsDOCX(combinedResults, filename);
      message.success('Word 文件已下载');
    } catch (error) {
      message.error('Word 导出失败');
    }
  };

  const handleReset = () => {
    resetStagedAnalysis();
    reset();
    navigate('/');
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) {
      message.warning('请输入问题');
      return;
    }

    if (!companyProfile) {
      message.error('请先完成分析');
      return;
    }

    setIsSendingMessage(true);
    try {
      await sendChatMessage(chatInput);
      setChatInput('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '发送失败';
      message.error(errorMessage);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const progressPercent = (completedStages.length / 4) * 100;
  const nextStage = getNextStage();
  const currentStageConfig = nextStage ? stages.find(s => s.stage === nextStage) : null;

  // Render results for each stage
  const renderStageResults = (stage: AnalysisStage) => {
    const stageResultIndex = completedStages.indexOf(stage);
    const stageResult = stageResultIndex >= 0 ? stageResults[stageResultIndex] : null;

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
            {stageResult.industryBackground && <IndustryBackgroundSection data={stageResult.industryBackground} />}
            {stageResult.nationalPolicy && <NationalPolicySection data={stageResult.nationalPolicy} />}
          </>
        )}
        {stage === 2 && (
          <>
            {stageResult.marketDemand && <MarketDemandSection data={stageResult.marketDemand} />}
            {stageResult.technologyStatus && <TechnologyStatusSection data={stageResult.technologyStatus} />}
          </>
        )}
        {stage === 3 && (
          <>
            {stageResult.applicationTrends && <ApplicationTrendsSection data={stageResult.applicationTrends} />}
            {stageResult.businessModel && <BusinessModelSection data={stageResult.businessModel} />}
          </>
        )}
        {stage === 4 && (
          <>
            {stageResult.industryEcosystem && <IndustryEcosystemSection data={stageResult.industryEcosystem} />}
            {stageResult.investmentOpportunity && <InvestmentOpportunitySection data={stageResult.investmentOpportunity} />}
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
        {companyProfile && (
          <CompanySummary profile={companyProfile} />
        )}

        {/* Progress */}
        <Card title="分析进度">
          <Progress
            percent={progressPercent}
            status={isAnalyzing ? 'active' : 'normal'}
            format={() => `${completedStages.length} / 4 阶段完成`}
          />
          <Divider />
          <Space direction="vertical" style={{ width: '100%' }}>
            {stages.map(stageConfig => {
              const isCompleted = completedStages.includes(stageConfig.stage);
              const isCurrent = currentStage === stageConfig.stage;

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
        {completedStages.map(stage => renderStageResults(stage))}

        {/* Next Stage Button */}
        {!isAllStagesCompleted() && nextStage && (
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Title level={4}>下一阶段：{currentStageConfig?.label}</Title>
                <Paragraph type="secondary">
                  {currentStageConfig?.description}
                </Paragraph>
                {nextStage === 2 && !isAnalyzing && (
                  <Alert
                    message="提示"
                    description="阶段 2 包含较多分析维度（市值、收入、利润、融资案例、政策风险），分析时间可能较长（3-5分钟），请耐心等待。"
                    type="info"
                    showIcon
                    style={{ marginTop: 12 }}
                  />
                )}
                {isAnalyzing && currentStage === 2 && (
                  <Alert
                    message="正在分析中"
                    description={
                      <>
                        <div>阶段 2 正在进行深度分析，这可能需要 3-5 分钟...</div>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">
                            分析维度包括：市场规模、收入情况、盈利分析、融资案例、政策风险
                          </Text>
                        </div>
                      </>
                    }
                    type="warning"
                    showIcon
                    style={{ marginTop: 12 }}
                  />
                )}
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
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportPDF}
                type="primary"
              >
                导出 PDF
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportDOCX}
                type="primary"
              >
                导出 Word
              </Button>
            </Space>
          </Card>
        )}

        {/* AI Chat */}
        {companyProfile && (
          <Card title="💬 AI 对话助手" className="section-card">
            <Paragraph type="secondary">
              基于您上传的文档和分析结果，向 AI 提问任何问题：
            </Paragraph>

            {/* Chat Messages */}
            {chatMessages.length > 0 && (
              <List
                dataSource={chatMessages}
                renderItem={(msg) => (
                  <List.Item style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: '100%' }}>
                      <Text strong style={{ color: msg.role === 'user' ? '#1890ff' : '#52c41a' }}>
                        {msg.role === 'user' ? '👤 您' : '🤖 AI'}:
                      </Text>
                      <div style={{ marginTop: 8, marginBottom: 0 }} className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </List.Item>
                )}
                style={{ maxHeight: 400, overflow: 'auto', marginBottom: 16 }}
              />
            )}

            {/* Chat Input */}
            <Space.Compact style={{ width: '100%' }}>
              <TextArea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="输入您的问题... (Shift+Enter 换行，Enter 发送)"
                autoSize={{ minRows: 2, maxRows: 6 }}
                disabled={isSendingMessage}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={isSendingMessage}
                style={{ height: 'auto' }}
              >
                发送
              </Button>
            </Space.Compact>
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
