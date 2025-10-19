import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthCard from "../../components/Auth/AuthCard";
import { TextInput, PasswordInput } from "../../components/Auth/Inputs";
import { Button } from "../../components/Auth/Button";
import { useAuth } from "../../services/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(redirectTo, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <AuthCard title="Welcome back" subtitle="Log in to continue to your dashboard.">
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}
          <TextInput 
            id="email" 
            label="Work email" 
            type="email" 
            autoComplete="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <PasswordInput 
            id="password" 
            label="Password" 
            autoComplete="current-password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <label className="inline-flex items-center gap-2 text-slate-600 text-sm">
            <input 
              type="checkbox" 
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" 
              checked={remember} 
              onChange={(e) => setRemember(e.target.checked)}
              disabled={isLoading}
            />
            Remember me
          </label>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-center text-sm text-slate-600">
            New to PSA?{" "}
            <Link to="/signup" className="text-teal-700 hover:text-teal-800 font-medium">Create an account</Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}