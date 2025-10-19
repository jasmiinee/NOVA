import React from 'react';
import { useAuth } from '../services/AuthContext';
import LeadershipPotential from '../components/LeadershipPotential';

export const Leadership = () => {
  const { user, token } = useAuth();

  if (!user?.employeeId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
        No employee selected. Please sign in to view your leadership assessment.
      </div>
    );
  }

  return (
    <div className="big-white rounded-lg">
      <LeadershipPotential employeeId={user.employeeId} token={token} />
    </div>
  );
};
