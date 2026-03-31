export function MentorCard({ mentor, onRequest }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition border-t-4 border-blue-600">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{mentor.mentor_name}</h3>
          <p className="text-gray-600">{mentor.current_role}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">{mentor.match_score}%</div>
          <p className="text-xs text-gray-500">Match</p>
        </div>
      </div>

      <div className="flex gap-4 mb-4 pb-4 border-b text-sm">
        <div>
          <p className="text-gray-600">Experience</p>
          <p className="font-bold">
            {
              (mentor.years_experience ?? (
                (mentor.hire_date || mentor.in_role_since)
                  ? Math.max(0, Math.floor((Date.now() - new Date(mentor.hire_date || mentor.in_role_since)) / (1000 * 60 * 60 * 24 * 365.25)))
                  : 0
              ))
            }
            + years
          </p>
        </div>
        <div>
          <p className="text-gray-600">Available</p>
          <p className="font-bold text-green-600">{mentor.available_slots} slots</p>
        </div>
      </div>

      {mentor.bio && (
        <div className="mb-4 italic text-gray-700 border-l-4 border-blue-600 pl-4">
          "{mentor.bio}"
        </div>
      )}

      {mentor.tagline && (
        <div className="mb-4 text-sm text-gray-600">
          <p className="font-bold mb-1">Tagline:</p>
          <p>"{mentor.tagline}"</p>
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm font-bold text-gray-700 mb-2">Mentoring Skills:</p>
        <div className="flex flex-wrap gap-2">
          {mentor.mentor_skills && mentor.mentor_skills.length > 0 ? (
            mentor.mentor_skills.map((skill, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                {skill}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No specific skills listed</span>
          )}
        </div>
      </div>

      <button
        onClick={onRequest}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-lg transition"
      >
        Request Mentorship
      </button>
    </div>
  );
}
