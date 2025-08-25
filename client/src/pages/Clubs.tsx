import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Clubs: React.FC = () => {
  return (
    <Container>
      <h1>Clubs</h1>
      <p>This page will show available clubs and allow users to join or create new ones.</p>
    </Container>
  );
};

export default Clubs;