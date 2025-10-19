import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../../components/Auth/AuthCard";
import { PasswordInput } from "../../components/Auth/Inputs";
import { Button } from "../../components/Auth/Button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const valid = password && confirm && password === confirm;

  function submit(e) {
    e.preventDefault();
    console.log({ action: "reset", password });
    // after API success:
    navigate("/");
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a strong password that you haven't used before."
    >
      <form onSubmit={submit} className="space-y-4">
        <PasswordInput
          id="password"
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          id="confirm"
          label="Confirm password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button type="submit" disabled={!valid}>
          Update password
        </Button>
      </form>
    </AuthCard>
  );
}
