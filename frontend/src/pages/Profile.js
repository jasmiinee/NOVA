import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import { Mail, Briefcase, Building, User, Calendar, Globe } from 'lucide-react';

export const Profile = () => {
  const { user, token } = useAuth();
  const [employeeData, setEmployeeData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
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
          setSkills(skillsData);
        }

        // Fetch position history
        const posResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/employees/${user.employeeId}/positions`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (posResponse.ok) {
          const posData = await posResponse.json();
          setPositions(posData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Information */}
        <div className="lg:col-span-1 space-y-6">
          <PersonalInfoCard employee={employeeData} />
          <LanguagesCard languages={employeeData?.languages || []} />
        </div>

        {/* Middle Column: Skills Matrix */}
        <div className="lg:col-span-1">
          <SkillsMatrixCard skills={skills} />
        </div>

        {/* Right Column: Career Timeline */}
        <div className="lg:col-span-1">
          <CareerTimelineCard positions={positions} />
        </div>
      </div>
    </div>
  );
};

// Personal Information Card
function PersonalInfoCard({ employee }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
      <div className="space-y-4">
        <InfoRow icon={User} label="Name" value={employee?.name} />
        <InfoRow icon={Mail} label="Email" value={employee?.email} />
        <InfoRow icon={Briefcase} label="Job Title" value={employee?.job_title} />
        <InfoRow icon={Building} label="Department" value={employee?.department} />
        <InfoRow icon={User} label="Manager" value={employee?.line_manager || 'N/A'} />
        <InfoRow icon={Calendar} label="Hire Date" value={formatDate(employee?.hire_date)} />
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-base font-medium text-gray-900">{value || 'N/A'}</p>
      </div>
    </div>
  );
}

// Languages Card
function LanguagesCard({ languages }) {
  // Mock data if not provided
  const langs = languages.length > 0 ? languages : [
    { language: 'English', proficiency: 'Fluent' },
    { language: 'Korean', proficiency: 'Intermediate' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages</h2>
      <div className="space-y-3">
        {langs.map((lang, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-gray-900 font-medium">{lang.language || lang}</span>
            <span className="text-sm text-gray-600 px-3 py-1 bg-amber-50 rounded-full">
              {lang.proficiency || 'Fluent'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skills Matrix Card
function SkillsMatrixCard({ skills }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills Matrix</h2>
      <div className="space-y-4">
        {skills.slice(0, 6).map((skill, i) => (
          <SkillRow key={i} skill={skill} />
        ))}
      </div>
    </div>
  );
}

function SkillRow({ skill }) {
  const level = skill.proficiency_level || 3;
  const maxLevel = 5;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{skill.skill_name}</h3>
          <p className="text-sm text-gray-500">{skill.specialization}</p>
        </div>
        <span className="text-sm font-semibold text-blue-600">
          {level}/{maxLevel}
        </span>
      </div>
      <div className="flex items-center space-x-1">
        {Array.from({ length: maxLevel }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              i < level ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Career Timeline Card
function CareerTimelineCard({ positions }) {
  const list = Array.isArray(positions) ? positions : [];
  const sortedPositions = list
    .slice() // shallow copy
    .sort((a, b) => new Date(b.start_date ?? 0) - new Date(a.start_date ?? 0));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Career Timeline</h2>

      {sortedPositions.length === 0 ? (
        <div className="text-center text-gray-500 py-6">
          No position history available
        </div>
      ) : (
        <div className="relative space-y-6">
          {/* Timeline line */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200" />
          {sortedPositions.map((pos, i) => (
            <TimelineItem
              key={pos.id ?? `${pos.role_title}-${pos.start_date}-${i}`}
              position={pos}
              isFirst={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineItem({ position, isFirst }) {
  // Your API returns focus_area as an array; support other shapes defensively
  let focusAreas = [];
  try {
    if (Array.isArray(position.focus_area)) focusAreas = position.focus_area;
    else if (Array.isArray(position.focus_areas)) focusAreas = position.focus_areas;
    else if (typeof position.focus_area === 'string') focusAreas = JSON.parse(position.focus_area);
  } catch { /* ignore parse errors */ }

  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div
        className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${
          isFirst ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
        }`}
      />
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900">{position.role_title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          {formatDate(position.start_date)} – {position.end_date ? formatDate(position.end_date) : 'Present'}
        </p>
        {focusAreas.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {focusAreas.slice(0, 3).map((area, i) => (
              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {area}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
