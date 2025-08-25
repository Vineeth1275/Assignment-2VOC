import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Profile: React.FC = () => {
  const { username } = useParams<{ username?: string }>();

  return (
    <Container>
      <h1>Profile</h1>
      <p>{username ? `Viewing ${username}'s profile` : 'Your profile'}</p>
      <p>This page will show user profile information, statistics, and settings.</p>
    </Container>
  );
};

export default Profile;