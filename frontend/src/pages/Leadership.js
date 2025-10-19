// src/pages/Leadership.js
import React from 'react';
import { useParams } from 'react-router-dom';
import LeadershipPotential from '../components/LeadershipPotential';

export const Leadership = () => {
  const { employeeId } = useParams();
  return (
    <div className="big-white rounded-lg">
      <LeadershipPotential employeeId={employeeId || 'EMP-20001'} />
    </div>
  );
};
