import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CareerPathways } from './pages/CareerPathways';
import './styles/App.css';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pathways" element={<CareerPathways />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
