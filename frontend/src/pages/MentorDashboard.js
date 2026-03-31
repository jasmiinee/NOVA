// frontend/src/pages/MentorDashboard.js
import { useEffect, useState } from 'react';
import { mentorAPI } from '../services/api';
import { EndMentorshipModal } from '../components/EndMentorshipModal';
import { useAuth } from '../services/AuthContext';

export function MentorDashboard() {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [activeMentorships, setActiveMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('requests');
  const [selectedMentorshipToEnd, setSelectedMentorshipToEnd] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);

  const employeeId = user?.employeeId;

  useEffect(() => {
    if (employeeId) {
      loadMentorData();
    }
  }, [employeeId]);

  const loadMentorData = async () => {
    setLoading(true);
    try {
      const [requestsData, mentorshipsData] = await Promise.all([
        mentorAPI.getMentoringRequests(employeeId),
        mentorAPI.getActiveMentorships(employeeId)
      ]);
      setIncomingRequests(requestsData.pending_requests || []);
      setActiveMentorships(mentorshipsData.active_mentorships || []);
    } catch (err) {
      console.error('Error loading mentor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await mentorAPI.respondToRequest(requestId, 'accepted');
      alert('Request accepted!');
      loadMentorData();
    } catch (err) {
      alert('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await mentorAPI.respondToRequest(requestId, 'rejected');
      alert('Request declined');
      loadMentorData();
    } catch (err) {
      alert('Failed to decline request');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const handleEndMentorship = (mentorship) => {
    setSelectedMentorshipToEnd(mentorship);
    setShowEndModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Your Mentoring Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setSelectedTab('requests')}
          className={`py-3 px-4 font-bold border-b-2 ${
            selectedTab === 'requests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600'
          }`}
        >
          Incoming Requests ({incomingRequests.length})
        </button>
        <button
          onClick={() => setSelectedTab('active')}
          className={`py-3 px-4 font-bold border-b-2 ${
            selectedTab === 'active'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600'
          }`}
        >
          Active Mentorships ({activeMentorships.length})
        </button>
      </div>

      {/* Incoming Requests Tab */}
      {selectedTab === 'requests' && (
        <div className="space-y-4">
          {incomingRequests.length > 0 ? (
            incomingRequests.map((request) => (
              <div key={request.request_id} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{request.mentee_name}</h3>
                    <p className="text-gray-600">{request.mentee_role}</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs font-bold">
                    Pending
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">Their Goals:</p>
                  <div className="flex flex-wrap gap-2">
                    {request.requested_skills?.map((skill) => (
                      <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4 bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-700">"{request.mentee_message}"</p>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                  <p>📅 Preferred frequency: <strong>{request.frequency}</strong></p>
                  <p>⏰ Best time: <strong>{request.preferred_time}</strong></p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleRejectRequest(request.request_id)}
                    className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptRequest(request.request_id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Accept Mentorship
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No incoming requests yet</p>
            </div>
          )}
        </div>
      )}

      {/* Active Mentorships Tab */}
      {selectedTab === 'active' && (
        <div className="space-y-4">
          {activeMentorships.length > 0 ? (
            activeMentorships.map((mentorship) => (
              <div key={mentorship.mentorship_id} className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{mentorship.mentee_name}</h3>
                    <p className="text-gray-600">{mentorship.mentee_role}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-bold">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Sessions Completed</p>
                    <p className="text-2xl font-bold">{mentorship.sessions_completed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Session</p>
                    <p className="text-sm font-bold">{mentorship.next_session_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-sm font-bold">{mentorship.duration_months} months</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                    Message
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Schedule Session
                  </button>
                  <button
                    onClick={() => handleEndMentorship(mentorship)}
                    className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
                  >
                    End Mentorship
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No active mentorships yet</p>
            </div>
          )}
        </div>
      )}

      {showEndModal && selectedMentorshipToEnd && (
        <EndMentorshipModal
          mentorship={selectedMentorshipToEnd}
          onClose={() => {
            setShowEndModal(false);
            setSelectedMentorshipToEnd(null);
          }}
          onSuccess={loadMentorData}
        />
      )}
    </div>
  );
}