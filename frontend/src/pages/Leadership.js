// src/pages/Leadership.js
import React from 'react';
import { useParams } from 'react-router-dom';
import LeadershipPotential from '../components/LeadershipPotential';

export const Leadership = () => {
  const { employeeId } = useParams();
  return (
    <div className="bg-gray-50 min-h-screen">
      <LeadershipPotential employeeId={employeeId || 'EMP-20001'} />
    </div>
  );
};
