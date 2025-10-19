import React, { useState, useEffect } from "react";
import { useAppData } from "../context/AppDataContext";
import { apiService } from "../services/api";

function FunctionAreaSelect({ value, options = [], onChange }) {
  const [query, setQuery] = useState('');
  const filtered = (query?.trim()
    ? options.filter(o => o.toLowerCase().includes(query.trim().toLowerCase()))
    : options
  ).slice(0, 50);

  return (
    <div className="rounded-md border">
      <div className="flex items-center px-2 border-b">
        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none">
          <path d="M21 21l-4.2-4.2M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search function areas…"
          className="w-full px-2 py-2 text-sm focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      <div className="max-h-56 overflow-auto">
        {!filtered.length ? (
          <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
        ) : (
          filtered.map((opt) => {
            const active = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-800'
                }`}
              >
                {opt}
              </button>
            );
          })
        )}
      </div>

      {value && (
        <div className="border-t px-3 py-2 bg-gray-50 text-xs text-gray-600">
          Selected: <span className="font-medium text-gray-900">{value}</span>
        </div>
      )}
    </div>
  );
}

export default function CareerPathways() {
  const { employee, employeeSkillNames = [], functionAreas = [], loading } = useAppData();

  // aspirations quiz
  const [fa, setFa] = useState("");
  const [shortTerm, setShortTerm] = useState("");
  const [longTerm, setLongTerm] = useState("");

  // results
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { pathways: [], internal_opportunities: [] }

  useEffect(() => {
    const id = employee?.employee_id;
    if (!id) return;
    (async () => {
      try {
        const { data } = await apiService.getLatestPathways(id);
        // data shape: { id, employee_id, aspiration, result, model_used, generated_at }
        if (data?.result) setResult(data.result);
        if (data?.aspiration?.function_area) {
          setFa(data.aspiration.function_area);
          setShortTerm(data.aspiration.short_term || "");
          setLongTerm(data.aspiration.long_term || "");
        }
      } catch (e) {
        // No saved record yet
      }
    })();
  }, [employee?.employee_id]);

  async function onGenerate(e) {
    e.preventDefault();
    if (!fa) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await apiService.assessPathways({
        employeeId: employee?.employee_id, // Samantha is auto-selected in context
        aspiration: {
          function_area: fa,
          short_term: shortTerm || undefined,
          long_term: longTerm || undefined,
        },
      });
      setResult(data?.result || null);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to generate pathways");
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Career Pathways</h1>
        <p className="text-gray-600">Find the perfect career pathway for you.</p>
      </header>

      {/* Aspirations quiz */}
      <form onSubmit={onGenerate} className="bg-white rounded-lg shadow overflow-hidden">
        {/* Card header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Career Aspiration</h2>
            <p className="text-sm text-gray-500">Pick a function area and share your goals. We’ll tailor a pathway from your current skills.</p>
          </div>
          {busy && (
            <div className="flex items-center text-sm text-blue-600">
              <span className="h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse" />
                Generating…
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Function Area selector (searchable) */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Function Area <span className="text-red-500">*</span></label>
            <FunctionAreaSelect
              value={fa}
              options={functionAreas}
              onChange={setFa}
            />
          </div>

          {/* Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Short-term goals (1–2 years)
              </label>
              <div className="relative">
                <textarea
                  className="mt-1 block w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={shortTerm}
                  maxLength={280}
                  onChange={(e) => setShortTerm(e.target.value)}
                  placeholder="e.g., Lead analytics initiatives across operations"
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">{shortTerm.length}/280</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Long-term goals (3–5 years)
              </label>
              <div className="relative">
                <textarea
                  className="mt-1 block w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={longTerm}
                  maxLength={280}
                  onChange={(e) => setLongTerm(e.target.value)}
                  placeholder="e.g., Drive enterprise-wide data strategy and governance"
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">{longTerm.length}/280</span>
              </div>
            </div>
          </div>

          {/* Error (if any) */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => { setFa(''); setShortTerm(''); setLongTerm(''); setError(''); }}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={!fa || busy}
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                !fa || busy ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {busy ? 'Generating…' : 'Save'}
            </button>
          </div>
        </div>
      </form>


      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pathways list */}
          <div className="lg:col-span-2 space-y-4">
            {result.pathways?.map((p, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{p.title}</h3>
                    <div className="mt-3">
                      <h4 className="font-medium text-gray-900 mb-1">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {(p.required_skills || p.requiredSkills || []).map((s, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {(p.gaps || p.skill_gaps)?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-1">Skill Gaps</h4>
                        <div className="flex flex-wrap gap-2">
                          {(p.gaps || p.skill_gaps).map((g, i) => (
                            <span key={i} className="px-2 py-1 text-xs rounded-full bg-rose-50 text-rose-900 ring-1 ring-rose-200">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{p.readiness ?? 0}%</div>
                    <div className="text-sm text-gray-500">{p.time_estimate || p.timeEstimate || "—"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Internal opportunities */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Internal Opportunities</h3>
              {!result.internal_opportunities?.length ? (
                <p className="text-sm text-gray-500">No matching roles found yet.</p>
              ) : (
                <div className="space-y-3">
                  {result.internal_opportunities.map((o, i) => (
                    <div key={i} className="rounded-lg p-4 bg-amber-50 border border-amber-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{o.title}</div>
                          <div className="text-xs text-gray-600">{o.unit} • {o.location} • {o.posted_at || "Recently"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-700">{o.match ?? 0}%</div>
                          <div className="text-[10px] text-gray-500">Match</div>
                        </div>
                      </div>
                      {!!(o.tags || []).length && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {o.tags.map((t, j) => (
                            <span key={j} className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Current skills */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Current Skills</h3>
        {!employeeSkillNames.length ? (
          <p className="text-sm text-gray-500">No skills found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employeeSkillNames.map((s, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{s}</h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
