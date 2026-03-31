import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/solid';

import { 
  TrendingUp, 
  BookOpen, 
  Users, 
  Target, 
  Award, 
  Calendar,
  ArrowRight,
  Star,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { SkillsRadarChart } from '../components/SkillsRadarChart';
import { mentorAPI } from '../services/api';

export const Dashboard = () => {
  const { user, token } = useAuth();
  const [employeeData, setEmployeeData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [leadershipScore, setLeadershipScore] = useState(null);
  const [leadershipTier, setLeadershipTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mentorStats, setMentorStats] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        if (!user?.employeeId || !token) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // Fetch employee profile
        const empResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/employees/${user.employeeId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!empResponse.ok) throw new Error('Failed to fetch employee data');
        const empData = await empResponse.json();
        setEmployeeData(empData);

        // Fetch skills
        const skillsResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/employees/${user.employeeId}/skills`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          // Transform skills for radar chart (take top 6)
          const formattedSkills = skillsData.slice(0, 6).map((skill) => ({
            skill: skill.skill_name,
            level: skill.proficiency_level || Math.floor(Math.random() * 3) + 3
          }));
          setSkills(formattedSkills);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEmployeeData();

    const ensureLeadershipScore = async () => {
    if (!user?.employeeId || !token) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/leadership/llm/${user.employeeId}/cached`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setLeadershipScore(data.overall_score);
        setLeadershipTier(data.tier);
      } else if (res.status === 429) {
        // Fallback to score if rate limited
        const s = await fetch(
          `${process.env.REACT_APP_API_URL}/leadership/${user.employeeId}/score`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (s.ok) {
          const sd = await s.json();
          setLeadershipScore(sd.overall_score);
          setLeadershipTier(sd.tier);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  ensureLeadershipScore();

  const fetchMentorStats = async () => {
    try {
      if (!user?.employeeId) return;
      const stats = await mentorAPI.getMentorStats(user.employeeId);
      setMentorStats(stats);
    } catch (e) {
      console.error('Error fetching mentor stats:', e);
    }
  };
  fetchMentorStats();
  }, [user, token]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-red-700">
        <p>Error loading dashboard: {error}</p>
      </div>
    );
  }

  const calculateYearsInRole = () => {
    if (!employeeData?.in_role_since) return 'N/A';
    const startDate = new Date(employeeData.in_role_since);
    const today = new Date();
    const years = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))/365;
    return years.toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {employeeData?.name || user?.email}
            </h1>
            <p className="text-gray-600 mt-1">
              {employeeData?.job_title} • {employeeData?.department}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <UserCircleIcon aria-hidden className="h-20 w-20 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Years at Company"
          value={calculateYearsInRole()}
          icon={Target}
          color="blue"
          trend="Going strong!"
        />
        <StatCard
          title="Leadership Readiness"
          value={leadershipScore ? `${leadershipScore}/100` : 'N/A'}
          icon={Star}
          color="purple"
          trend={leadershipTier || 'View assessment'}
          link="/leadership"
        />
        <StatCard
          title="Mentor Sessions"
          value={mentorStats ? String(mentorStats.total_sessions_completed) : '—'}
          icon={Users}
          color="orange"
          trend={mentorStats ? `${mentorStats.total_upcoming_sessions} scheduled` : undefined}
        />
      </div>

      {/* Skills Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-900 text-center">Skills Overview</h3>
          <div className="flex items-center justify-center">
            {skills.length > 0 ? (
              <div className="mx-auto" style={{ width: 480, height: 340 }}>
                <SkillsRadarChart skills={skills} />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No skills data available</p>
            )}
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            View detailed skills
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

         {/* AI Coach Quick Access */}
        <div className="bg-white rounded-lg shadow p-6 shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-center">AI Career Coach</h2>
            <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
              <span className="mr-1">AI</span>
              <MessageSquare size={14} />
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-100 p-5 mb-5">
            <p className="text-emerald-900/90 italic leading-7">
              “{'Based on your progress, I recommend focusing on leadership skills for your next career move.'}”
            </p>
          </div>
          <Link
            to="/aicoach"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 transition"
          >
            Chat with Coach
          </Link>
          </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && <p className="text-xs text-gray-500">{trend}</p>}
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);
