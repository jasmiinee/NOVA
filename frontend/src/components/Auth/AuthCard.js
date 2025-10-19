import React from "react";

export default function AuthCard({ title, subtitle, children }) {
return (
<div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
<div className="mb-6">
<h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
{subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
</div>
{children}
</div>
);
}