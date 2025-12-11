import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Select, Input, Button, Checkbox, Alert, Space, Typography } from 'antd';
import { ApiOutlined, KeyOutlined, RightOutlined } from '@ant-design/icons';
import { useAppStore } from '../lib/store';
import { getAllProviders } from '../lib/llmClient';
import { ProviderId } from '../types';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function ProviderSelectPage() {
  const navigate = useNavigate();
  const { providerId, apiKey, rememberApiKey, setProvider, setApiKey } = useAppStore();

  const [localProviderId, setLocalProviderId] = useState<ProviderId | null>(providerId);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localRemember, setLocalRemember] = useState(rememberApiKey);
  const [error, setError] = useState<string | null>(null);

  const providers = getAllProviders();

  const handleNext = () => {
    if (!localProviderId) {
      setError('请选择一个 LLM 供应商');
      return;
    }

    if (!localApiKey.trim()) {
      setError('请输入 API Key');
      return;
    }

    // Save to store
    setProvider(localProviderId);
    setApiKey(localApiKey, localRemember);

    // Navigate to upload page
    navigate('/upload');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={2} className="page-title">
          AI BP 智能投研助手
        </Title>
        <Paragraph className="page-subtitle">
          专业的 BP 分析工具，支持多个大模型供应商
        </Paragraph>
      </div>

      <Card className="section-card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              <ApiOutlined /> 选择 LLM 供应商
            </label>
            <Select
              size="large"
              style={{ width: '100%' }}
              placeholder="请选择一个供应商"
              value={localProviderId}
              onChange={(value) => {
                setLocalProviderId(value);
                setError(null);
              }}
            >
              {providers.map((provider) => (
                <Option key={provider.id} value={provider.id}>
                  {provider.displayName}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              <KeyOutlined /> API Key
            </label>
            <Input.Password
              size="large"
              placeholder="请输入您的 API Key"
              value={localApiKey}
              onChange={(e) => {
                setLocalApiKey(e.target.value);
                setError(null);
              }}
            />
            <div style={{ marginTop: 8 }}>
              <Checkbox
                checked={localRemember}
                onChange={(e) => setLocalRemember(e.target.checked)}
              >
                在本地浏览器记住 API Key
              </Checkbox>
            </div>
          </div>

          <Alert
            message="安全提示"
            description="您的 API Key 仅保存在本地浏览器中，不会上传到任何服务器。由于是纯前端应用，API Key 会直接调用第三方 API，存在一定安全风险。生产环境建议使用后端代理方式。"
            type="warning"
            showIcon
          />

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          <Button
            type="primary"
            size="large"
            icon={<RightOutlined />}
            block
            onClick={handleNext}
          >
            下一步
          </Button>
        </Space>
      </Card>

      <div style={{ textAlign: 'center', marginTop: 24, color: '#999' }}>
        <Paragraph type="secondary">
          支持 PDF、PPTX、DOCX 格式 | 最大 10 MB | 10 个分析维度
        </Paragraph>
      </div>
    </div>
  );
}
