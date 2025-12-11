import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import ProviderSelectPage from './routes/ProviderSelectPage';
import UploadAndOptionsPage from './routes/UploadAndOptionsPage';
import ResultPage from './routes/ResultPage';
import './App.css';

const { Content } = Layout;

function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Content>
          <Routes>
            <Route path="/" element={<ProviderSelectPage />} />
            <Route path="/upload" element={<UploadAndOptionsPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
