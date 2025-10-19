import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AiCoach } from './pages/AiCoach';
import { CareerPathways } from './pages/CareerPathways';
import { Dashboard } from './pages/Dashboard';
import { Leadership } from './pages/Leadership';
import './styles/App.css';



function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pathways" element={<CareerPathways />} />
            <Route path="/aicoach" element={<AiCoach />} />
            <Route path="/leadership" element={<Leadership />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
