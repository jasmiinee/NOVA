import { useEffect, useState } from 'react';
import { MentorCard } from '../components/MentorCard';
import { MentorRequestModal } from '../components/MentorRequestModal';
import { MentorRegistration } from '../components/MentorRegistration';
import { MentorDashboard } from './MentorDashboard';
import { MenteeActiveMentorships } from '../components/MenteeActiveMentorships';
import { mentorAPI } from '../services/api';
import { PendingMentorshipRequests } from '../components/PendingMentorshipRequests';

export function Mentorship() {
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [userRole, setUserRole] = useState('mentee');
  const [isMentor, setIsMentor] = useState(false);

  const employeeId = 'EMP-20002';

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const mentorCheck = await mentorAPI.checkIfMentor(employeeId);
      setIsMentor(mentorCheck.is_mentor);
      setUserRole(mentorCheck.is_mentor ? 'both' : 'mentee');

      const data = await mentorAPI.getMentorMatches(employeeId);
      setMentors(data.mentor_matches || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeMentor = () => {
    setActiveTab('register');
  };

  const handleRegistrationSuccess = () => {
    setIsMentor(true);
    setUserRole('both');
    setActiveTab('mentor-dashboard');
    loadInitialData();
  };

  const handleRequestMentorship = async (formData) => {
    try {
      await mentorAPI.requestMentorship(
        employeeId,
        selectedMentor.mentor_id,
        formData.goals,
        formData.message,
        formData.frequency,
        formData.preferredTime
      );
      alert('Mentorship request sent!');
      setShowRequestModal(false);
      setSelectedMentor(null);
    } catch (err) {
      alert('Failed to send request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Mentorship Hub</h1>
        {!isMentor && (
          <button
            onClick={handleBecomeMentor}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Become a Mentor
          </button>
        )}
      </div>

      {/* Tabs */}
        <div className="flex gap-2 border-b overflow-x-auto">
        <button
            onClick={() => setActiveTab('discover')}
            className={`py-3 px-4 font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'discover'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
            🔍 Find Mentors
        </button>

        <button
            onClick={() => setActiveTab('my-requests')}
            className={`py-3 px-4 font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'my-requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
            📬 My Requests
        </button>

        <button
            onClick={() => setActiveTab('my-mentors')}
            className={`py-3 px-4 font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'my-mentors'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
            👥 My Mentors
        </button>

        {isMentor && (
            <button
            onClick={() => setActiveTab('mentor-dashboard')}
            className={`py-3 px-4 font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === 'mentor-dashboard'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            >
            📊 My Mentees
            </button>
        )}

        {!isMentor && (
            <button
            onClick={() => setActiveTab('register')}
            className={`py-3 px-4 font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === 'register'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            >
            ✨ Become a Mentor
            </button>
        )}

      </div>

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div className="grid gap-6">
          {mentors.length > 0 ? (
            mentors.map((mentor, idx) => (
              <MentorCard
                key={idx}
                mentor={mentor}
                onRequest={() => {
                  setSelectedMentor(mentor);
                  setShowRequestModal(true);
                }}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No mentors available</p>
            </div>
          )}
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === 'my-requests' && (
        <PendingMentorshipRequests employeeId={employeeId} />
    )}

      {/* My Mentors Tab (Mentee View) */}
      {activeTab === 'my-mentors' && (
        <MenteeActiveMentorships employeeId={employeeId} />
      )}

      {/* Register as Mentor Tab */}
      {activeTab === 'register' && (
        <MentorRegistration employeeId={employeeId} onSuccess={handleRegistrationSuccess} />
      )}

      {/* Mentor Dashboard Tab (Mentor View) */}
      {activeTab === 'mentor-dashboard' && <MentorDashboard employeeId={employeeId} />}

      {/* Request Modal */}
      {showRequestModal && selectedMentor && (
        <MentorRequestModal
          mentor={selectedMentor}
          onSubmit={handleRequestMentorship}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedMentor(null);
          }}
        />
      )}
    </div>
  );
}