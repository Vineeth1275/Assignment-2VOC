import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
`;

const ClubDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Container>
      <h1>Club Details</h1>
      <p>Club ID: {id}</p>
      <p>This page will show club information, members, discussions, and polls.</p>
    </Container>
  );
};

export default ClubDetails;