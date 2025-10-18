import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CareerPathways } from './pages/CareerPathways';
import { AiCoach } from './pages/AiCoach';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/pathways" element={<CareerPathways />} />
            <Route path="/coach" element={<AiCoach />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
