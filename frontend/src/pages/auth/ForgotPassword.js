import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../../components/Auth/AuthCard";
import { TextInput } from "../../components/Auth/Inputs";
import { Button } from "../../components/Auth/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();
    console.log({ action: "forgot", email });
    // after API success:
    navigate("/reset-password");
  }

  return (
    <AuthCard title="Forgot password" subtitle="We’ll send you a secure link to reset it.">
      <form onSubmit={submit} className="space-y-4">
        <TextInput
          id="email"
          label="Work email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit">Send reset link</Button>

        <p className="text-center text-sm text-slate-600">
          Remembered it?{" "}
          <Link to="/" className="text-teal-700 hover:text-teal-800 font-medium">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
