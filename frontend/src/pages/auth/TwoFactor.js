import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../../components/Auth/AuthCard";
import { TextInput } from "../../components/Auth/Inputs";
import { Button } from "../../components/Auth/Button";

export default function TwoFactorPage() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();
    console.log({ action: "2fa", code });
    // after API success:
    navigate("/");
  }

  return (
    <AuthCard title="Two-factor authentication" subtitle="Enter the 6-digit code from your authenticator app.">
      <form onSubmit={submit} className="space-y-4">
        <TextInput id="otp" label="One-time code" value={code} onChange={(e)=>setCode(e.target.value)} placeholder="123456" />
        <Button type="submit">Verify and continue</Button>
        <p className="text-center text-sm text-slate-600">
          Lost access?{" "}
          <Link to="/recover-account" className="text-teal-700 hover:text-teal-800">Use a recovery method</Link>
        </p>
      </form>
    </AuthCard>
  );
}
