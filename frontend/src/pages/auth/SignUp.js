// src/pages/auth/SignUp.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../../components/Auth/AuthCard";
import { TextInput, PasswordInput } from "../../components/Auth/Inputs";
import { Button } from "../../components/Auth/Button";
import { useAuth } from "../../services/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    
    try {
      const result = await signup(email, password, employeeId);
      if (result.success) {
        navigate("/dashboard", { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err?.message || "Signup failed");
    }
  }

  return (
    <AuthCard title="Create your account" subtitle="Join the PSA Career Platform to start your pathway.">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}
        <TextInput 
          id="employeeId" 
          label="Employee ID" 
          value={employeeId} 
          onChange={(e) => setEmployeeId(e.target.value)} 
        />
        <TextInput 
          id="email" 
          label="Work email" 
          type="email" 
          autoComplete="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <PasswordInput 
          id="password" 
          label="Create password" 
          autoComplete="new-password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <Button type="submit">Create account</Button>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/" className="text-teal-700 hover:text-teal-800 font-medium">Sign in</Link>
        </p>
      </form>
    </AuthCard>
  );
}