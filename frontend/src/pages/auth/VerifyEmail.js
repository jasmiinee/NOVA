import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../../components/Auth/AuthCard";
import { TextInput } from "../../components/Auth/Inputs";
import { Button } from "../../components/Auth/Button";

export default function VerifyEmailPage() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();
    console.log({ action: "verify", code });
    // after API success:
    navigate("/");
  }

  return (
    <AuthCard title="Verify your email" subtitle="Enter the 6-digit code we sent to your inbox.">
      <form onSubmit={submit} className="space-y-4">
        <TextInput id="code" label="Verification code" value={code} onChange={(e)=>setCode(e.target.value)} placeholder="123456" />
        <Button type="submit">Confirm email</Button>
        <p className="text-center text-sm text-slate-600">
          Didn’t get it?{" "}
          <button type="button" onClick={() => console.log("resend code")} className="text-teal-700 hover:text-teal-800 font-medium">
            Resend code
          </button>
        </p>
      </form>
    </AuthCard>
  );
}
