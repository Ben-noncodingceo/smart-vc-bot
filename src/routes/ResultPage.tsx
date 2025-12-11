import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Alert,
  Space,
  Typography,
  Steps,
  Spin,
  Input,
  List,
  message,
  Divider
} from 'antd';
import {
  CheckCircleOutlined,
  DownloadOutlined,
  CopyOutlined,
  SendOutlined,
  HomeOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useAppStore } from '../lib/store';
import { useAnalysis } from '../hooks/useAnalysis';
import { exportAsJSON, exportAsMarkdown, downloadFile, copyToClipboard } from '../lib/export';

import CompanySummary from '../components/ResultSections/CompanySummary';
import {
  MarketCapSection,
  FrontierSection,
  PublicPeersSection,
  StageSection,
  RevenueSection,
  ProfitSection,
  PolicyRiskSection,
  InvestmentValueSection,
  FinancingCasesSection,
  PapersSection
} from '../components/ResultSections/AnalysisSections';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function ResultPage() {
  const navigate = useNavigate();
  const {
    analysisStatus,
    analysisError,
    companyProfile,
    analysisResult,
    chatMessages,
    reset
  } = useAppStore();

  const { sendChatMessage } = useAnalysis();

  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    // Redirect if no analysis has been done
    if (!companyProfile && analysisStatus === 'idle') {
      navigate('/');
    }
  }, [companyProfile, analysisStatus, navigate]);

  const handleExportJSON = () => {
    if (!analysisResult) return;

    const json = exportAsJSON(analysisResult);
    const filename = `${companyProfile?.name || 'company'}_analysis_${Date.now()}.json`;
    downloadFile(json, filename, 'application/json');
    message.success('JSON 文件已下载');
  };

  const handleExportMarkdown = () => {
    if (!analysisResult) return;

    const markdown = exportAsMarkdown(analysisResult);
    const filename = `${companyProfile?.name || 'company'}_analysis_${Date.now()}.md`;
    downloadFile(markdown, filename, 'text/markdown');
    message.success('Markdown 文件已下载');
  };

  const handleCopyJSON = async () => {
    if (!analysisResult) return;

    try {
      const json = exportAsJSON(analysisResult);
      await copyToClipboard(json);
      message.success('JSON 已复制到剪贴板');
    } catch (error) {
      message.error('复制失败');
    }
  };

  const handleCopyMarkdown = async () => {
    if (!analysisResult) return;

    try {
      const markdown = exportAsMarkdown(analysisResult);
      await copyToClipboard(markdown);
      message.success('Markdown 已复制到剪贴板');
    } catch (error) {
      message.error('复制失败');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) {
      message.warning('请输入您的问题');
      return;
    }

    setIsSendingMessage(true);

    try {
      await sendChatMessage(chatInput);
      setChatInput('');
      message.success('消息已发送');
    } catch (error) {
      message.error('发送失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleStartOver = () => {
    reset();
    navigate('/');
  };

  // Render loading state
  if (analysisStatus === 'parsing' || analysisStatus === 'extractingProfile' || analysisStatus === 'analyzing') {
    const stepMap = {
      parsing: 0,
      extractingProfile: 1,
      analyzing: 2
    };

    return (
      <div className="page-container">
        <div className="page-header">
          <Title level={2} className="page-title">
            正在分析中...
          </Title>
        </div>

        <Card>
          <Steps
            current={stepMap[analysisStatus]}
            items={[
              { title: '解析文档', icon: analysisStatus === 'parsing' ? <LoadingOutlined /> : undefined },
              { title: '提取企业信息', icon: analysisStatus === 'extractingProfile' ? <LoadingOutlined /> : undefined },
              { title: '多维度分析', icon: analysisStatus === 'analyzing' ? <LoadingOutlined /> : undefined }
            ]}
          />

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Spin size="large" />
            <Paragraph style={{ marginTop: 16 }}>
              请稍候，AI 正在分析您的文档...
            </Paragraph>
          </div>
        </Card>
      </div>
    );
  }

  // Render error state
  if (analysisStatus === 'error' || analysisError) {
    return (
      <div className="page-container">
        <div className="page-header">
          <Title level={2} className="page-title">
            分析失败
          </Title>
        </div>

        <Alert
          message="分析过程中出现错误"
          description={analysisError}
          type="error"
          showIcon
        />

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Space>
            <Button onClick={() => navigate('/upload')}>
              返回上传页面
            </Button>
            <Button type="primary" onClick={handleStartOver}>
              重新开始
            </Button>
          </Space>
        </div>
      </div>
    );
  }

  // Render results
  if (!analysisResult || !companyProfile) {
    return (
      <div className="page-container">
        <Alert
          message="暂无分析结果"
          description="请先上传文件并完成分析"
          type="info"
          showIcon
        />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button type="primary" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={2} className="page-title">
          分析结果
        </Title>
        <Paragraph className="page-subtitle">
          {companyProfile.name} - 企业分析报告
        </Paragraph>
      </div>

      <Steps
        current={2}
        items={[
          { title: '选择供应商', icon: <CheckCircleOutlined /> },
          { title: '上传配置', icon: <CheckCircleOutlined /> },
          { title: '查看结果', icon: <CheckCircleOutlined /> }
        ]}
        style={{ maxWidth: 600, margin: '0 auto 40px' }}
      />

      {/* Company Summary */}
      <CompanySummary profile={companyProfile} />

      {/* Analysis Sections */}
      {analysisResult.marketCap && <MarketCapSection data={analysisResult.marketCap} />}
      {analysisResult.frontier && <FrontierSection data={analysisResult.frontier} />}
      {analysisResult.publicPeers && <PublicPeersSection data={analysisResult.publicPeers} />}
      {analysisResult.stage && <StageSection data={analysisResult.stage} />}
      {analysisResult.revenue && <RevenueSection data={analysisResult.revenue} />}
      {analysisResult.profit && <ProfitSection data={analysisResult.profit} />}
      {analysisResult.policyRisk && <PolicyRiskSection data={analysisResult.policyRisk} />}
      {analysisResult.investmentValue && <InvestmentValueSection data={analysisResult.investmentValue} />}
      {analysisResult.financingCases && <FinancingCasesSection data={analysisResult.financingCases} />}
      {analysisResult.papers && <PapersSection data={analysisResult.papers} />}

      {/* Export Buttons */}
      <Card className="section-card" title="导出分析结果">
        <Space wrap>
          <Button icon={<DownloadOutlined />} onClick={handleExportJSON}>
            下载 JSON
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportMarkdown}>
            下载 Markdown
          </Button>
          <Button icon={<CopyOutlined />} onClick={handleCopyJSON}>
            复制 JSON
          </Button>
          <Button icon={<CopyOutlined />} onClick={handleCopyMarkdown}>
            复制 Markdown
          </Button>
        </Space>
      </Card>

      {/* Chat Section */}
      <Card className="section-card" title="AI 对话 - 进一步提问">
        <Paragraph type="secondary">
          基于分析结果和原始文档，您可以向 AI 提出更多问题。
        </Paragraph>

        {chatMessages.length > 0 && (
          <div className="chat-messages" style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
            <List
              dataSource={chatMessages}
              renderItem={(msg) => (
                <List.Item
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: msg.role === 'user' ? '#e6f7ff' : '#f5f5f5',
                    marginBottom: 8
                  }}
                >
                  <div style={{ width: '100%' }}>
                    <Text strong>{msg.role === 'user' ? '您' : 'AI'}：</Text>
                    <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                      {msg.content}
                    </Paragraph>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}

        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            placeholder="请输入您的问题..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            autoSize={{ minRows: 2, maxRows: 6 }}
            disabled={isSendingMessage}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={isSendingMessage}
          >
            发送
          </Button>
        </Space.Compact>
      </Card>

      {/* Actions */}
      <Card className="section-card">
        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Button
            icon={<HomeOutlined />}
            size="large"
            onClick={handleStartOver}
          >
            分析新文档
          </Button>
        </Space>
      </Card>

      <Divider />

      <div style={{ textAlign: 'center', color: '#999' }}>
        <Paragraph type="secondary">
          报告生成时间：{new Date().toLocaleString('zh-CN')}
        </Paragraph>
      </div>
    </div>
  );
}
