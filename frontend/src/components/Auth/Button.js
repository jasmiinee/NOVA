import React from "react";

export function Button({ children, type = "button", onClick, variant = "primary", className = "", disabled }) {
const base = "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition shadow-sm focus:outline-none focus:ring-4 disabled:opacity-50";
const styles = {
primary: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-200/70",
secondary: "bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 focus:ring-slate-200",
ghost: "bg-transparent text-teal-700 hover:bg-teal-50 focus:ring-teal-100",
};
return (
<button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
{children}
</button>
);
}
export function Divider({ label = "or" }) {
return (
<div className="my-6 flex items-center gap-4">
<div className="h-px flex-1 bg-slate-200" />
<span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
<div className="h-px flex-1 bg-slate-200" />
</div>
);
}
export function OAuthButtons() {
return (
<div className="grid grid-cols-1 gap-3">
<Button variant="secondary" onClick={() => console.log("OAuth: Microsoft")}>Continue with Microsoft</Button>
<Button variant="secondary" onClick={() => console.log("OAuth: Google")}>Continue with Google</Button>
</div>
);
}