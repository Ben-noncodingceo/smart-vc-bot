import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import ProviderSelectPage from './routes/ProviderSelectPage';
import UploadAndOptionsPage from './routes/UploadAndOptionsPage';
import StagedResultPage from './routes/StagedResultPage';
import './App.css';

const { Content, Footer } = Layout;

function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Content>
          <Routes>
            <Route path="/" element={<ProviderSelectPage />} />
            <Route path="/upload" element={<UploadAndOptionsPage />} />
            <Route path="/result" element={<StagedResultPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center', background: '#f0f2f5', padding: '16px 50px' }}>
          联系作者： <a href="mailto:sunpeng@eduzhixin.com">sunpeng@eduzhixin.com</a>
        </Footer>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
