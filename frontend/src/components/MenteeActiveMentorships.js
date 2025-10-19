// frontend/src/components/MenteeActiveMentorships.js
import { useEffect, useState } from 'react';
import { mentorAPI } from '../services/api';
import { MenteeSessionModal } from './MenteeSessionModal';

export function MenteeActiveMentorships({ employeeId }) {
  const [activeMentors, setActiveMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

  useEffect(() => {
    loadMenteeData();
  }, []);

  const loadMenteeData = async () => {
    setLoading(true);
    try {
      const data = await mentorAPI.getMyActiveMentors(employeeId);
      setActiveMentors(data.active_mentors || []);
    } catch (err) {
      console.error('Error loading mentee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSession = (mentorship) => {
    setSelectedMentorship(mentorship);
    setShowSessionModal(true);
  };

  const handleSessionScheduled = () => {
    setShowSessionModal(false);
    setSelectedMentorship(null);
    loadMenteeData();
  };

  if (loading) {
    return <div className="text-center py-8">Loading your mentorships...</div>;
  }

  return (
    <div className="space-y-4">
      {activeMentors.length > 0 ? (
        activeMentors.map((mentorship) => (
          <div
            key={mentorship.mentorship_id}
            className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">{mentorship.mentor_name}</h3>
                <p className="text-gray-600">{mentorship.mentor_role}</p>
                {mentorship.mentor_bio && (
                  <p className="text-sm text-gray-700 mt-2 italic">"{mentorship.mentor_bio}"</p>
                )}
              </div>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-xs font-bold">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
              <div>
                <p className="text-sm text-gray-600">Mentoring Skills</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {mentorship.mentor_skills?.map((skill) => (
                    <span key={skill} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Your Goals</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {mentorship.mentee_goals?.map((goal) => (
                    <span key={goal} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
              <div>
                <p className="text-sm text-gray-600">Sessions Completed</p>
                <p className="text-2xl font-bold">{mentorship.sessions_completed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Session</p>
                <p className="text-sm font-bold">{mentorship.next_session_date || 'Not scheduled'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-sm font-bold">{mentorship.duration_months} months</p>
              </div>
            </div>

            <div className="mb-4 bg-blue-50 p-3 rounded border-l-2 border-blue-600">
              <p className="text-xs text-gray-600 font-bold">Meeting Frequency</p>
              <p className="text-sm font-bold text-blue-900">{mentorship.frequency} • {mentorship.preferred_time}</p>
            </div>

            {mentorship.mentor_rating && (
              <div className="mb-4 flex items-center gap-2">
                <p className="text-sm text-gray-600">Mentor Rating:</p>
                <div className="flex items-center gap-1">
                  {'⭐'.repeat(Math.round(mentorship.mentor_rating))}
                  <span className="text-sm text-gray-600">({mentorship.mentor_reviews_count} reviews)</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Message {mentorship.mentor_name.split(' ')[0]}
              </button>
              <button
                onClick={() => handleScheduleSession(mentorship)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Schedule Session
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                View Progress
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No active mentorships yet</p>
          <p className="text-sm text-gray-500">
            Start by finding a mentor in the "Find Mentors" tab
          </p>
        </div>
      )}

      {showSessionModal && selectedMentorship && (
        <MenteeSessionModal
          mentorship={selectedMentorship}
          onClose={() => {
            setShowSessionModal(false);
            setSelectedMentorship(null);
          }}
          onSuccess={handleSessionScheduled}
        />
      )}
    </div>
  );
}