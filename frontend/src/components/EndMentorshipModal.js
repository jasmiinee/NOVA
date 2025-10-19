import { useState } from 'react';
import { mentorAPI } from '../services/api';

export function EndMentorshipModal({ mentorship, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('completed');

  const reasonOptions = [
    { value: 'completed', label: 'Goals achieved' },
    { value: 'schedule', label: 'Scheduling conflicts' },
    { value: 'direction', label: 'Change in direction' },
    { value: 'other', label: 'Other reason' }
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await mentorAPI.endMentorship(
        mentorship.mentorship_id,
        feedback,
        rating
      );
      alert('Mentorship ended successfully');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to end mentorship: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
        <div className="bg-red-600 text-white p-6">
          <h2 className="text-2xl font-bold">End Mentorship</h2>
          <p className="text-red-100 mt-1">Step {step} of 2</p>
        </div>

        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Why are you ending this mentorship?</h3>
              <div className="space-y-2">
                {reasonOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value={opt.value}
                      checked={reason === opt.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="mr-3"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full mt-6 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Share your feedback (optional)</h3>
              
              <div>
                <label className="block text-sm font-bold mb-2">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ Good</option>
                  <option value={3}>⭐⭐⭐ Average</option>
                  <option value={2}>⭐⭐ Fair</option>
                  <option value={1}>⭐ Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Your feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What did you learn? How did they help you? Any suggestions?"
                  className="w-full px-4 py-3 border rounded h-24 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                >
                  {loading ? 'Ending...' : 'End Mentorship'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}