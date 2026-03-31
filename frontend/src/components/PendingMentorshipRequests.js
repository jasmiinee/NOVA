// frontend/src/components/PendingMentorshipRequests.js
import { useEffect, useState } from 'react';
import { mentorAPI } from '../services/api';
import { useAuth } from '../services/AuthContext';

export function PendingMentorshipRequests() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');

  const employeeId = user?.employeeId;

  useEffect(() => {
    if (employeeId) {
      loadPendingRequests();
    }
  }, [employeeId]);

  const loadPendingRequests = async () => {
    setLoading(true);
    try {
      const data = await mentorAPI.getMyPendingRequests(employeeId);
      setPendingRequests(data.pending_requests || []);
    } catch (err) {
      console.error('Error loading pending requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      try {
        await mentorAPI.cancelRequest(requestId);
        alert('Request cancelled');
        loadPendingRequests();
      } catch (err) {
        alert('Failed to cancel request');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your requests...</div>;
  }

  const filteredRequests = pendingRequests.filter(req => 
    filterStatus === 'all' || req.status === filterStatus
  );

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded font-medium transition ${
            filterStatus === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pending ({pendingRequests.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilterStatus('accepted')}
          className={`px-4 py-2 rounded font-medium transition ${
            filterStatus === 'accepted'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Accepted ({pendingRequests.filter(r => r.status === 'accepted').length})
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-4 py-2 rounded font-medium transition ${
            filterStatus === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Declined ({pendingRequests.filter(r => r.status === 'rejected').length})
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded font-medium transition ${
            filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
      </div>

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.request_id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                request.status === 'pending'
                  ? 'border-yellow-400'
                  : request.status === 'accepted'
                  ? 'border-green-400'
                  : 'border-red-400'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{request.mentor_name}</h3>
                  <p className="text-gray-600">{request.mentor_role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold ${
                      request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>

              {request.mentor_bio && (
                <div className="mb-4 italic text-gray-700 border-l-4 border-blue-600 pl-4">
                  "{request.mentor_bio}"
                </div>
              )}

              {request.mentor_skills && request.mentor_skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">Mentor Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {request.mentor_skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm font-bold text-gray-700 mb-2">Your Goals:</p>
                <div className="flex flex-wrap gap-2">
                  {request.requested_skills?.map((skill) => (
                    <span
                      key={skill}
                      className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {request.mentee_message && (
                <div className="mb-4 bg-gray-50 p-3 rounded">
                  <p className="text-xs font-bold text-gray-600 mb-1">Your Message:</p>
                  <p className="text-sm text-gray-700">"{request.mentee_message}"</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b text-sm">
                <div>
                  <p className="text-gray-600">Frequency</p>
                  <p className="font-bold">{request.frequency}</p>
                </div>
                <div>
                  <p className="text-gray-600">Preferred Time</p>
                  <p className="font-bold">{request.preferred_time}</p>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Requested on {new Date(request.created_at).toLocaleDateString()}
                {request.accepted_at && (
                  <span>
                    {' '}
                    · Accepted on {new Date(request.accepted_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              {request.status === 'pending' && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleCancelRequest(request.request_id)}
                    className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
                  >
                    Cancel Request
                  </button>
                </div>
              )}

              {request.status === 'accepted' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    Great news! {request.mentor_name.split(' ')[0]} accepted your mentorship request.
                    Check the "My Mentors" tab to start scheduling sessions.
                  </p>
                </div>
              )}

              {request.status === 'rejected' && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                  <p className="text-sm text-gray-700">
                    Unfortunately, {request.mentor_name.split(' ')[0]} is not available at this time.
                    Try requesting from another mentor or reach out later.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No {filterStatus} requests yet</p>
          <p className="text-sm text-gray-500">
            {filterStatus === 'pending'
              ? 'Request mentorship from a mentor in the "Find Mentors" tab'
              : 'Check back later or request from other mentors'}
          </p>
        </div>
      )}
    </div>
  );
}