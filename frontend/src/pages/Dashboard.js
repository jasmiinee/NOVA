import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  BookOpen, 
  Users, 
  Target, 
  Award, 
  Calendar,
  ArrowRight,
  Star,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { SkillsRadarChart } from '../components/SkillsRadarChart';

export const Dashboard = () => {
  const { user, token } = useAuth();
  const [employeeData, setEmployeeData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const calculateDaysInRole = () => {
    if (!employeeData?.in_role_since) return 'N/A';
    const startDate = new Date(employeeData.in_role_since);
    const today = new Date();
    const daysInRole = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    return daysInRole;
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
            <div className="text-right">
              <p className="text-sm text-gray-500">Days in current role</p>
              <p className="text-2xl font-bold text-blue-600">
                {calculateDaysInRole()} days
              </p>
            </div>
            <img
              src={employeeData?.avatar || "https://via.placeholder.com/80x80.png?text=SL"}
              alt="Profile"
              className="h-20 w-20 rounded-full border-4 border-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Career Readiness"
          value="75%"
          icon={Target}
          color="blue"
          trend="+5% this month"
        />
        <StatCard
          title="Skills Developed"
          value={skills.length || '12'}
          icon={Award}
          color="green"
          trend="3 new this quarter"
        />
        <StatCard
          title="Learning Hours"
          value="48"
          icon={BookOpen}
          color="purple"
          trend="8 hrs this week"
        />
        <StatCard
          title="Mentor Sessions"
          value="6"
          icon={Users}
          color="orange"
          trend="2 scheduled"
        />
      </div>

      {/* Skills Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">Skills Overview</h3>
          <div className="flex justify-center">
            {skills.length > 0 ? (
              <SkillsRadarChart skills={skills} />
            ) : (
              <p className="text-gray-500 text-center py-8">No skills data available</p>
            )}
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-4"
          >
            View detailed skills
            <ArrowRight className="ml-1 h-4 w-4" />
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