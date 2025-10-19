import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import CareerPathways from './pages/CareerPathways';
import { AiCoach } from './pages/AiCoach';
import { Dashboard } from './pages/Dashboard';
import { Leadership } from './pages/Leadership';
import { Profile } from './pages/Profile';
import { Mentorship } from './pages/Mentorship';
import './styles/App.css';

import LoginPage from './pages/auth/Login';
import SignupPage from './pages/auth/SignUp';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import ResetPasswordPage from './pages/auth/ResetPassword';
import VerifyEmailPage from './pages/auth/VerifyEmail';
import TwoFactorPage from './pages/auth/TwoFactor';
import RequireAuth from './components/Auth/RequireAuth';
import { AuthProvider } from './services/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/2fa" element={<TwoFactorPage />} />

          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pathways" element={<CareerPathways />} />
            <Route path="/aicoach" element={<AiCoach />} />
            <Route path="/leadership" element={<Leadership />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mentorship" element={<Mentorship />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}