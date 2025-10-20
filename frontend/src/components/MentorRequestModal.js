import { useState, useEffect } from 'react';
import { mentorAPI } from '../services/api';

export function MentorRequestModal({ mentor, onSubmit, onClose }) {
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    goals: [],
    message: '',
    frequency: 'weekly',
    preferredTime: 'afternoon'
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const data = await mentorAPI.getSkillsTaxonomy();
      setSkills(data.skills || []);
    } catch (err) {
      console.error('Error loading skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = skills.filter(skill =>
    skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.function_area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (skillName) => {
    setFormData({
      ...formData,
      goals: formData.goals.includes(skillName)
        ? formData.goals.filter(g => g !== skillName)
        : [...formData.goals, skillName]
    });
  };

  if (loading && step === 1) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 sticky top-0">
          <h2 className="text-2xl font-bold">Request Mentorship from {mentor.mentor_name}</h2>
          <p className="text-blue-100 mt-1">Step {step} of 3</p>
        </div>

        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">What skills do you want to develop?</h3>
                <p className="text-gray-600 mb-4">Search PSA's skill taxonomy and select skills you want help with</p>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search skills (e.g., 'Cloud', 'Leadership', 'Finance')..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {filteredSkills.length > 0 ? (
                    filteredSkills.map((skill) => (
                      <label
                        key={skill.id}
                        className="flex items-start p-3 border rounded cursor-pointer hover:bg-blue-50 transition"
                      >
                        <input
                          type="checkbox"
                          checked={formData.goals.includes(skill.skill_name)}
                          onChange={() => toggleGoal(skill.skill_name)}
                          className="mr-3 w-4 h-4 mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-sm">{skill.skill_name}</p>
                          <p className="text-xs text-gray-600">{skill.function_area}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No skills found</p>
                  )}
                </div>
              </div>

              {formData.goals.length > 0 && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm font-bold text-blue-900 mb-2">Selected Skills ({formData.goals.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.goals.map((skill) => (
                      <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Tell {mentor.mentor_name.split(' ')[0]} why you want to work with them</h3>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Share your thoughts about what you'd like to achieve together..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Mentorship Preferences</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">How often can you meet?</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Best time?</label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-gray-50 p-6 flex gap-3 justify-between sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && formData.goals.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.message.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}