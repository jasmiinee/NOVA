import React, { useState } from "react";

export function TextInput({ id, label, type = "text", autoComplete, value, onChange, placeholder }) {
return (
<label htmlFor={id} className="group block">
<div className="relative mt-3">
<input
id={id}
type={type}
autoComplete={autoComplete}
value={value}
onChange={onChange}
placeholder={placeholder || " "}
className="peer w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-200/60"
/>
<span className="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-slate-500 transition peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-slate-400 peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:text-teal-700">{label}</span>
</div>
</label>
);
}
export function PasswordInput(props) {
const [show, setShow] = useState(false);
return (
<div className="relative">
<TextInput {...props} type={show ? "text" : "password"} />
<button
type="button"
onClick={() => setShow((s) => !s)}
className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-600 hover:text-slate-900"
>
{show ? "Hide" : "Show"}
</button>
</div>
);
}