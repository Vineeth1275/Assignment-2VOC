import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';

const DashboardContainer = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Welcome = styled.h1`
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text};
`;

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardContainer>
      <Welcome>Welcome back, {user?.username}!</Welcome>
      <p>Dashboard content will be implemented here with:</p>
      <ul>
        <li>Recent activity</li>
        <li>Continue watching section</li>
        <li>Recommendations</li>
        <li>Statistics overview</li>
        <li>Friend activity</li>
      </ul>
    </DashboardContainer>
  );
};

export default Dashboard;