// src/components/LeadershipPotential.js
import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertCircle, Target, Users, Lightbulb } from 'lucide-react';

export default function LeadershipPotential({ employeeId , token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!employeeId) throw new Error('No employee selected');
        setLoading(true);
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/leadership/llm/${employeeId}/cached`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
              : { 'Content-Type': 'application/json' }
          }
        );
        if (!res.ok) throw new Error(`Failed to fetch assessment: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [employeeId, token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Brain className="animate-pulse h-16 w-16 text-blue-600" />
        <p className="text-lg text-gray-600">AI is analyzing leadership potential...</p>
      </div>
    );
  }
  if (error) return <div className="text-red-700 bg-red-50 border border-red-200 rounded-md p-4">{error}</div>;
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500 text-lg">
        No assessment available
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-8 px-6">
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Leadership Assessment</h1>
        <p className="text-gray-600">Optional evaluation to understand your leadership potential</p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Score Gauge + Component Bars */}
        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* Score Gauge */}
          <div className="flex justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#E0E7FF"
                strokeWidth="16"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#4A90E2"
                strokeWidth="16"
                strokeDasharray={`${(data.overall_score / 100) * 502.4} 502.4`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
              <text
                x="100"
                y="95"
                textAnchor="middle"
                fontSize="48"
                fontWeight="bold"
                fill="#1F2937"
              >
                {data.overall_score}
              </text>
              <text
                x="100"
                y="115"
                textAnchor="middle"
                fontSize="14"
                fill="#6B7280"
              >
                Overall Score
              </text>
            </svg>
          </div>

          {/* Component Bars */}
          <div className="space-y-5">
            <MetricBar label="Strategic Thinking" value={data.component_scores.performance} />
            <MetricBar label="Team Leadership" value={data.component_scores.learning_agility} />
            <MetricBar label="Innovation" value={data.component_scores.stability} />
            <MetricBar label="Communication" value={70} />
          </div>
        </div>

        {/* Right Panel: Development Areas */}
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Development Areas</h2>
          
          <div className="space-y-4">
            {data.development_areas.slice(0, 3).map((area, i) => (
              <DevelopmentCard
                key={i}
                title={area}
                description={data.recommended_development[i] || 'Explore relevant programs'}
                actionLabel={i === 0 ? 'Explore Programs' : i === 1 ? 'Find Opportunities' : 'Schedule Discussion'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-4">
            <Target size={20} className="text-blue-600" />
            <span>Key Strengths</span>
          </h3>
          <ul className="space-y-3">
            {data.strengths.map((s, i) => (
              <li key={i} className="flex items-start space-x-2 text-sm text-gray-700 border-b border-gray-100 pb-2 last:border-0">
                <span className="text-green-600 font-semibold">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-4">
            <Users size={20} className="text-blue-600" />
            <span>Next Role Options</span>
          </h3>
          <ul className="space-y-3">
            {data.next_role_options.map((role, i) => (
              <li key={i} className="flex items-center space-x-2 text-sm text-gray-700 border-b border-gray-100 pb-2 last:border-0">
                <TrendingUp size={16} className="text-blue-500" />
                <span>{role}</span>
              </li>
            ))}
          </ul>
        </div>

        {data.risk_factors && data.risk_factors.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-4">
              <AlertCircle size={20} className="text-yellow-600" />
              <span>Areas to Monitor</span>
            </h3>
            <ul className="space-y-3">
              {data.risk_factors.map((r, i) => (
                <li key={i} className="text-sm text-gray-700 border-b border-gray-100 pb-2 last:border-0">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-center space-x-2 bg-white rounded-lg shadow p-4 text-sm text-gray-500">
        <Brain size={16} />
        <span>Generated by {data.model_used} on {new Date(data.generated_at).toLocaleDateString()}</span>
      </footer>
    </div>
  );
}

function MetricBar({ label, value }) {
  const getColor = (val) => {
    if (val >= 75) return 'bg-green-500';
    if (val >= 60) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${getColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function DevelopmentCard({ title, description, actionLabel }) {
  return (
    <div className="flex space-x-4 p-5 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
        <Lightbulb size={24} className="text-blue-600" />
      </div>
      <div className="flex-1 space-y-2">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        <button className="mt-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
