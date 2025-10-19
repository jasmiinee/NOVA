import { useState, useEffect } from 'react';
import { mentorAPI } from '../services/api';

export function MentorRegistration({ employeeId, onSuccess }) {
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    mentoring_skills: [],
    max_mentees: 3,
    bio: ''
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

  const toggleSkill = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await mentorAPI.registerAsMentor(employeeId, {
        mentoring_skills: selectedSkills,
        max_mentees: formData.max_mentees,
        bio: formData.bio
      });
      alert('Successfully registered as mentor!');
      onSuccess && onSuccess();
    } catch (err) {
      alert('Failed to register: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === 1) {
    return <div className="text-center py-8">Loading skills...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Become a Mentor</h2>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold mb-2">What skills can you mentor?</h3>
            <p className="text-gray-600 mb-4">Search and select the skills from PSA's taxonomy</p>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search skills (e.g., 'Cloud', 'Leadership', 'Finance')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-gray-50">
              {filteredSkills.length > 0 ? (
                filteredSkills.map((skill) => (
                  <label
                    key={skill.id}
                    className="flex items-start p-3 border rounded cursor-pointer hover:bg-blue-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill.skill_name)}
                      onChange={() => toggleSkill(skill.skill_name)}
                      className="mr-3 w-4 h-4 mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-sm">{skill.skill_name}</p>
                      <p className="text-xs text-gray-600">{skill.function_area}</p>
                      {skill.specialization && (
                        <p className="text-xs text-gray-500">{skill.specialization}</p>
                      )}
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No skills found matching your search</p>
              )}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm font-bold text-blue-900 mb-2">
                Selected Skills ({selectedSkills.length})
              </p>
              {selectedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-2"
                    >
                      {skill}
                      <button
                        onClick={() => toggleSkill(skill)}
                        className="hover:bg-blue-700 rounded p-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No skills selected yet</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={selectedSkills.length === 0}
            className="w-full mt-6 bg-blue-600 text-white py-2 rounded disabled:bg-gray-400 hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Tell us about yourself</h3>

          <div>
            <label className="block text-sm font-bold mb-2">Bio (optional)</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="What's your mentoring philosophy? What do you enjoy helping with?"
              className="w-full px-4 py-3 border rounded h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">How many mentees can you support?</label>
            <select
              value={formData.max_mentees}
              onChange={(e) => setFormData({ ...formData, max_mentees: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded"
            >
              <option value={1}>1 mentee</option>
              <option value={2}>2 mentees</option>
              <option value={3}>3 mentees</option>
              <option value={5}>5 mentees</option>
              <option value={10}>10+ mentees</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded border">
            <p className="text-sm font-bold text-gray-700 mb-2">Your Mentoring Skills:</p>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Registering...' : 'Become a Mentor'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}