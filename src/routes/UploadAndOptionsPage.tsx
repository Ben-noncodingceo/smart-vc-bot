import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Upload,
  Button,
  Alert,
  Space,
  Typography,
  Steps,
  message
} from 'antd';
import {
  InboxOutlined,
  FileTextOutlined,
  RightOutlined,
  LeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useAppStore } from '../lib/store';
import { validateFile, parseFile, getFileSummary } from '../lib/fileParser';
import { useStagedAnalysis } from '../hooks/useStagedAnalysis';

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

export default function UploadAndOptionsPage() {
  const navigate = useNavigate();
  const {
    providerId,
    apiKey,
    uploadedFile,
    documentText,
    analysisStatus,
    setUploadedFile,
    setDocumentText,
    setParsedFileName
  } = useAppStore();

  const { isAnalyzing, startStagedAnalysis } = useStagedAnalysis();

  const [localFile, setLocalFile] = useState<File | null>(uploadedFile);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileSummary, setFileSummary] = useState<string>('');

  useEffect(() => {
    // Redirect if provider or API key is not set
    if (!providerId || !apiKey) {
      navigate('/');
    }
  }, [providerId, apiKey, navigate]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf,.pptx,.docx',
    maxCount: 1,
    beforeUpload: (file) => {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        message.error(validation.error || '文件验证失败');
        return false;
      }

      // Parse file
      handleFileParse(file);

      return false; // Prevent auto upload
    },
    onRemove: () => {
      setLocalFile(null);
      setUploadedFile(null);
      setDocumentText('');
      setFileSummary('');
      setParseError(null);
    },
    fileList: localFile ? [
      {
        uid: '-1',
        name: localFile.name,
        status: 'done',
        size: localFile.size,
        type: localFile.type
      }
    ] as any : []
  };

  const handleFileParse = async (file: File) => {
    setIsParsing(true);
    setParseError(null);

    try {
      const result = await parseFile(file);
      setLocalFile(file);
      setUploadedFile(file);
      setDocumentText(result.text);
      setParsedFileName(file.name);

      const summary = getFileSummary(file, result);
      setFileSummary(summary);

      message.success('文件解析成功！');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '文件解析失败';
      setParseError(errorMessage);
      message.error(errorMessage);
    } finally {
      setIsParsing(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!localFile) {
      message.error('请先上传文件');
      return;
    }

    await startStagedAnalysis();

    // Navigate to result page after analysis starts
    if (analysisStatus !== 'error') {
      navigate('/result');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={2} className="page-title">
          上传文件与配置分析
        </Title>
        <Paragraph className="page-subtitle">
          上传 BP 文档并选择分析维度
        </Paragraph>
      </div>

      <Steps
        current={1}
        items={[
          { title: '选择供应商', icon: <CheckCircleOutlined /> },
          { title: '上传配置', icon: <FileTextOutlined /> },
          { title: '查看结果' }
        ]}
        style={{ maxWidth: 600, margin: '0 auto 40px' }}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* File Upload */}
        <Card className="section-card" title="上传 BP / 企业介绍文档">
          <Dragger {...uploadProps} disabled={isParsing || isAnalyzing}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持 PDF、PPTX、DOCX 格式，文件大小不超过 10 MB
            </p>
          </Dragger>

          {isParsing && (
            <Alert
              message="正在解析文件..."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}

          {fileSummary && (
            <Alert
              message="文件解析完成"
              description={fileSummary}
              type="success"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}

          {parseError && (
            <Alert
              message="文件解析失败"
              description={parseError}
              type="error"
              showIcon
              closable
              onClose={() => setParseError(null)}
              style={{ marginTop: 16 }}
            />
          )}
        </Card>

        {/* Analysis Info */}
        <Card className="section-card" title="分析说明">
          <Paragraph type="secondary">
            分析将分为 4 个阶段进行，每个阶段独立调用 API：
          </Paragraph>
          <ol style={{ paddingLeft: 20 }}>
            <li><strong>技术、行业前沿</strong> - 核心论文、前沿技术、公开对标企业</li>
            <li><strong>商业数据商业价值</strong> - 市值范围、营收规模、利润情况、融资案例、政策风险</li>
            <li><strong>团队、执行</strong> - 发展阶段判断</li>
            <li><strong>综合评价投资价值</strong> - 投资价值综合评级</li>
          </ol>
          <Paragraph type="secondary" style={{ marginTop: 16 }}>
            每个阶段完成后，可以查看结果并继续下一阶段。全部完成后可导出完整报告。
          </Paragraph>
        </Card>

        {/* Action Buttons */}
        <Card className="section-card">
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              icon={<LeftOutlined />}
              onClick={() => navigate('/')}
              disabled={isAnalyzing}
            >
              上一步
            </Button>

            <Button
              type="primary"
              size="large"
              icon={<RightOutlined />}
              onClick={handleStartAnalysis}
              loading={isAnalyzing}
              disabled={!localFile || !documentText || isParsing}
            >
              {isAnalyzing ? '准备中...' : '开始分阶段分析'}
            </Button>
          </Space>
        </Card>
      </Space>
    </div>
  );
}
