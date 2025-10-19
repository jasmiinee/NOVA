import { useState } from 'react';
import { mentorAPI } from '../services/api';

export function MenteeSessionModal({ mentorship, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    proposed_date: '',
    proposed_time: 'afternoon',
    agenda: '',
    session_type: 'video'
  });
  const [loading, setLoading] = useState(false);

  const sessionTypes = [
    { value: 'video', label: 'Video Call' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'in-person', label: 'In Person' },
    { value: 'async', label: 'Async (recorded Q&A)' }
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await mentorAPI.scheduleSession(
        mentorship.mentorship_id,
        formData.proposed_date,
        formData.proposed_time,
        formData.agenda,
        formData.session_type
      );
      alert('Session request sent to your mentor!');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to schedule session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
          <h2 className="text-2xl font-bold">Schedule a Session</h2>
          <p className="text-purple-100 mt-1">with {mentorship.mentor_name.split(' ')[0]}</p>
          <p className="text-purple-100 text-sm">Step {step} of 3</p>
        </div>

        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">When would you like to meet?</h3>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  min={minDate}
                  value={formData.proposed_date}
                  onChange={(e) => setFormData({ ...formData, proposed_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Time</label>
                <select
                  value={formData.proposed_time}
                  onChange={(e) => setFormData({ ...formData, proposed_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                >
                  <option value="morning">Morning (9am-12pm)</option>
                  <option value="afternoon">Afternoon (12pm-5pm)</option>
                  <option value="evening">Evening (5pm-8pm)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.proposed_date}
                className="w-full mt-6 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">How would you like to connect?</h3>

              <div className="space-y-2">
                {sessionTypes.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      value={type.value}
                      checked={formData.session_type === type.value}
                      onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                      className="mr-3"
                    />
                    <span className="font-medium">{type.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">What's on your agenda?</h3>
              <p className="text-sm text-gray-600">Help your mentor prepare by sharing topics you want to discuss</p>

              <textarea
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                placeholder="e.g., 'Discuss cloud architecture best practices, get feedback on my project proposal'"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none h-28 resize-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.agenda.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Scheduling...' : 'Request Session'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}