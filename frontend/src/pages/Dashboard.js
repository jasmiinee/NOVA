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
  Star
} from 'lucide-react';
import { SkillsRadarChart } from '../components/SkillsRadarChart';

export const Dashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUserProfile("Samantha");
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

// TODO: Replace mockData with actual API data when backend is ready, {userProfile?.jobTitle}, {userProfile?.department}, all the skills

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, Samantha
            </h1>
            <p className="text-gray-600 mt-1">
               Cloud Solutions Architect • IT Infrastructure 
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Days in current role</p>
              <p className="text-2xl font-bold text-blue-600"> 24 days
                {/*Math.floor((new Date() - new Date(userProfile?.inRoleSince)) / (1000 * 60 * 60 * 24))*/}
              </p>
            </div>
            <img
              src={userProfile?.avatar || "https://via.placeholder.com/80x80.png?text=SL"}
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
          value="12"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Overview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 text-center">Skills Overview</h3>
            <div className="flex justify-center">
            <SkillsRadarChart skills={[
      { skill: "Cloud Architecture", level: 5 },
      { skill: "Cloud DevOps & Automation", level: 4 },
      { skill: "Securing Cloud Infrastructure", level: 3 },
      { skill: "Network Architecture", level: 2 },
      { skill: "Middleware & Web Servers", level: 3 },
      { skill: "Enterprise Architecture", level: 4 },
    ]}/>
            </div>
            <Link
              to="/profile"
              className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              View detailed skills
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
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